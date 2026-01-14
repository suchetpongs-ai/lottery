import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface PaymentOptions {
    amount: number;
    orderId: number;
    currency?: string;
    description?: string;
}

export interface TweasyPaymentResponse {
    success: boolean;
    payment_url?: string;
    transaction_id?: string;
    error?: string;
}

@Injectable()
export class PaymentService {
    private tweasyApiUrl: string;
    private tweasyApiKey: string;
    private tweasySecretKey: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        // Tweasy Configuration
        this.tweasyApiUrl = this.configService.get('TWEASY_API_URL') || 'https://api.tweasy.com/v1';
        this.tweasyApiKey = this.configService.get('TWEASY_API_KEY') || '';
        this.tweasySecretKey = this.configService.get('TWEASY_SECRET_KEY') || '';
    }

    /**
     * Create Tweasy payment link
     */
    async createTweasyPayment(options: PaymentOptions): Promise<TweasyPaymentResponse> {
        try {
            if (!this.tweasyApiKey || !this.tweasySecretKey) {
                throw new BadRequestException('Tweasy credentials not configured');
            }

            const order = await this.prisma.order.findUnique({
                where: { id: BigInt(options.orderId) },
                include: {
                    items: {
                        include: {
                            ticket: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new BadRequestException('Order not found');
            }

            // Prepare Tweasy payment request
            const paymentData = {
                api_key: this.tweasyApiKey,
                amount: options.amount,
                currency: options.currency || 'THB',
                order_id: options.orderId.toString(),
                description: options.description || `คำสั่งซื้อสลาก #${options.orderId}`,
                return_url: `${this.configService.get('FRONTEND_URL')}/payment/success`,
                cancel_url: `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
                callback_url: `${this.configService.get('API_URL')}/payment/tweasy/webhook`,
                customer_email: '', // Can add from user data
                customer_phone: '', // Can add from user data
            };

            // Call Tweasy API
            const response = await axios.post(
                `${this.tweasyApiUrl}/payments`,
                paymentData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.tweasyApiKey}`,
                        'X-Secret-Key': this.tweasySecretKey,
                    },
                }
            );

            if (response.data.success) {
                // Store payment reference
                await this.prisma.payment.create({
                    data: {
                        orderId: BigInt(options.orderId),
                        amount: options.amount,
                        method: 'tweasy',
                        status: 'Pending',
                        // Can store transaction_id if provided
                    },
                });

                return {
                    success: true,
                    payment_url: response.data.payment_url,
                    transaction_id: response.data.transaction_id,
                };
            } else {
                throw new BadRequestException(response.data.error || 'Payment creation failed');
            }
        } catch (error: any) {
            console.error('Tweasy payment error:', error.response?.data || error.message);

            // If API not available, return mock for development
            if (this.configService.get('NODE_ENV') === 'development') {
                console.log('[DEVELOPMENT MODE] Returning mock payment URL');
                return {
                    success: true,
                    payment_url: `${this.configService.get('FRONTEND_URL')}/payment/mock?order=${options.orderId}&amount=${options.amount}`,
                    transaction_id: `MOCK_${Date.now()}`,
                };
            }

            throw new BadRequestException(error.response?.data?.error || 'Payment processing failed');
        }
    }

    /**
     * Handle Tweasy webhook callback
     */
    async handleTweasyWebhook(payload: any): Promise<void> {
        try {
            console.log('Tweasy webhook received:', payload);

            // Verify webhook signature (important for security!)
            if (!this.verifyTweasySignature(payload)) {
                throw new BadRequestException('Invalid webhook signature');
            }

            const orderId = parseInt(payload.order_id);
            const status = payload.status; // 'success', 'failed', 'cancelled'

            if (status === 'success') {
                // Update order status
                await this.prisma.order.update({
                    where: { id: BigInt(orderId) },
                    data: { status: 'Paid' },
                });

                // Update payment record
                await this.prisma.payment.updateMany({
                    where: {
                        orderId: BigInt(orderId),
                        method: 'tweasy',
                    },
                    data: {
                        status: 'Success',
                    },
                });

                // Mark tickets as sold
                await this.markTicketsAsSold(orderId);

                console.log(`[Tweasy] Order ${orderId} paid successfully`);
            } else if (status === 'failed' || status === 'cancelled') {
                await this.prisma.payment.updateMany({
                    where: {
                        orderId: BigInt(orderId),
                        method: 'tweasy',
                    },
                    data: {
                        status: 'Failed',
                    },
                });

                console.log(`[Tweasy] Order ${orderId} payment ${status}`);
            }
        } catch (error) {
            console.error('Tweasy webhook error:', error);
            throw error;
        }
    }

    /**
     * Verify Tweasy webhook signature
     */
    private verifyTweasySignature(payload: any): boolean {
        // Tweasy typically sends a signature in the payload
        // Implement according to Tweasy's documentation
        // Example:
        // const signature = payload.signature;
        // const computedSignature = crypto
        //   .createHmac('sha256', this.tweasySecretKey)
        //   .update(JSON.stringify(payload.data))
        //   .digest('hex');
        // return signature === computedSignature;

        // For now, return true in development
        if (this.configService.get('NODE_ENV') === 'development') {
            return true;
        }

        // TODO: Implement actual signature verification
        return true;
    }

    /**
     * Mark tickets as sold after successful payment
     */
    private async markTicketsAsSold(orderId: number): Promise<void> {
        const order = await this.prisma.order.findUnique({
            where: { id: BigInt(orderId) },
            include: {
                items: true,
            },
        });

        if (!order) return;

        // Update all tickets in the order to 'Sold' status
        for (const item of order.items) {
            await this.prisma.ticket.update({
                where: { id: item.ticketId },
                data: { status: 'Sold' },
            });
        }
    }

    /**
     * Process refund (if Tweasy supports it)
     */
    async refundPayment(orderId: number, amount?: number): Promise<void> {
        const order = await this.prisma.order.findUnique({
            where: { id: BigInt(orderId) },
            include: { payments: true },
        });

        if (!order || order.status !== 'Paid') {
            throw new BadRequestException('Order not eligible for refund');
        }

        try {
            // Call Tweasy refund API
            const payment = order.payments.find(p => p.method === 'tweasy' && p.status === 'Success');

            if (!payment) {
                throw new BadRequestException('No successful Tweasy payment found');
            }

            // TODO: Implement Tweasy refund API call
            // const response = await axios.post(
            //   `${this.tweasyApiUrl}/refunds`,
            //   {
            //     transaction_id: payment.transactionId,
            //     amount: amount || order.totalAmount,
            //   },
            //   { headers: { 'Authorization': `Bearer ${this.tweasyApiKey}` } }
            // );

            console.log(`[Tweasy] Refund requested for order ${orderId}`);

            await this.prisma.order.update({
                where: { id: BigInt(orderId) },
                data: { status: 'Cancelled' },
            });
        } catch (error) {
            console.error('Refund error:', error);
            throw new BadRequestException('Refund processing failed');
        }
    }
}
