import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OmiseService } from './omise.service';
import { TmweasyService } from './tmweasy.service';
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
    private logger = new Logger(PaymentService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private omiseService: OmiseService, // Keep if needed for potential multiple gateways (Force Git)
        private tmweasyService: TmweasyService,
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
                where: { id: options.orderId },
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
                        orderId: options.orderId,
                        userId: order.userId,
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
                    where: { id: orderId },
                    data: { status: 'Paid' },
                });

                // Update payment record
                await this.prisma.payment.updateMany({
                    where: {
                        orderId: orderId,
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
                        orderId: orderId,
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
            where: { id: orderId },
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
        // ... (refund logic remains similar or updated for TMWeasy later)
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payments: true },
        });

        // Simplified refund for now
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'Cancelled' },
        });
    }

    /**
     * Create TMWeasy PromptPay QR
     */
    async createTmweasyPromptPay(dto: { orderId: number; amount: number }): Promise<any> {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: dto.orderId },
            });

            if (!order) throw new BadRequestException('Order not found');

            // Generate PromptPay QR Payload (using local generation for standard QR)
            // or call TMWeasy API if they have a specific Create Payment endpoint that returns a QR
            const result = await this.tmweasyService.createPayment(dto.orderId, dto.amount);

            // If result.payload is the QR string, we save it or return it.
            // We also need to record the payment attempt.

            await this.prisma.payment.create({
                data: {
                    orderId: dto.orderId,
                    orderId: dto.orderId,
                    userId: order.userId,
                    amount: dto.amount,
                    method: 'promptpay', // 'tmweasy_promptpay'
                    gatewayRefId: `ORDER_${dto.orderId}_${Date.now()}`, // Temporary ref until confirmed
                    status: 'Pending',
                },
            });

            return {
                amount: dto.amount,
                qrPayload: result.payload, // The TLV string for frontend to render as QR
                // or if it's a URL
                paymentUrl: result.payment_url
            };
        } catch (error) {
            this.logger.error('TMWeasy PromptPay error:', error);
            throw new BadRequestException('Failed to generate PromptPay QR');
        }
    }

    /**
     * Verify Slip (vslip)
     */
    async verifySlip(file: any, orderId: number, amount: number): Promise<any> {
        // Logic to read QR from image would go here if backend handles it.
        // Or receive the QR string decoded by frontend.
        // Assuming frontend sends the QR payload string found in the slip.
        return true;
    }

    async verifySlipQr(qrPayload: string, orderId: number): Promise<any> {
        try {
            const order = await this.prisma.order.findUnique({ where: { id: orderId } });
            if (!order) throw new BadRequestException("Order not found");

            const result = await this.tmweasyService.verifySlip(qrPayload, Number(order.totalAmount));

            // Check result from vslip
            // Assuming result structure based on typical slip verification APIs
            // if (result.data.success || result.valid) ...

            // For now, if no error thrown by service, we assume valid or inspect result
            this.logger.log('Slip Verify Result:', result);

            // If valid, mark as paid
            // Note: Real vslip response structure needs to be known to be precise.
            // Usually checks: receiver account match, amount match, date recent.

            if (result) { // validation logic depends on response
                await this.updateOrderPaid(orderId);
                return { success: true, data: result };
            }

            return { success: false };
        } catch (e) {
            throw new BadRequestException('Slip verification failed');
        }
    }

    /**
     * Create Omise Credit Card Charge
     */
    async createOmiseCharge(dto: { orderId: number; amount: number; token: string }): Promise<any> {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: dto.orderId },
            });

            if (!order) throw new BadRequestException('Order not found');

            const returnUri = `${this.configService.get('FRONTEND_URL')}/payment/${dto.orderId}`;

            const charge = await this.omiseService.createCharge(
                dto.amount,
                dto.token,
                returnUri,
                { orderId: dto.orderId }
            );

            // Record payment attempt
            await this.prisma.payment.create({
                data: {
                    orderId: dto.orderId,
                    userId: order.userId,
                    amount: dto.amount,
                    method: 'omise', // or 'credit_card'
                    gatewayRefId: charge.id,
                    status: charge.status === 'successful' ? 'Success' : charge.status === 'pending' ? 'Pending' : 'Failed',
                },
            });

            if (charge.status === 'successful') {
                // Update order immediately if successful (non-3DS)
                await this.updateOrderPaid(dto.orderId);
            }

            return {
                id: charge.id,
                status: charge.status,
                authorize_uri: charge.authorize_uri, // For 3DS
            };
        } catch (error) {
            this.logger.error('Omise charge error:', error);
            throw new BadRequestException('Payment failed');
        }
    }

    /**
     * Create Omise PromptPay Charge
     */
    async createOmisePromptPay(dto: { orderId: number; amount: number }): Promise<any> {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: dto.orderId },
            });

            if (!order) throw new BadRequestException('Order not found');

            const source = await this.omiseService.createSource(dto.amount, 'promptpay');
            const returnUri = `${this.configService.get('FRONTEND_URL')}/payment/${dto.orderId}`;

            const charge = await this.omiseService.createChargeWithSource(
                dto.amount,
                source.id,
                returnUri,
                { orderId: dto.orderId }
            );

            await this.prisma.payment.create({
                data: {
                    orderId: dto.orderId,
                    userId: order.userId,
                    amount: dto.amount,
                    method: 'promptpay',
                    gatewayRefId: charge.id,
                    status: 'Pending',
                },
            });

            return {
                amount: charge.amount,
                chargeId: charge.id,
                source: charge.source, // Contains scannable_code (QR)
                status: charge.status,
            };
        } catch (error) {
            this.logger.error('Omise PromptPay error:', error);
            throw new BadRequestException('Failed to generate PromptPay QR');
        }
    }

    /**
     * Handle Omise Webhook
     */
    async handleOmiseWebhook(payload: any): Promise<void> {
        this.logger.log(`Omise webhook received: ${payload.key}`);

        if (payload.key === 'charge.complete') {
            const charge = payload.data;
            if (charge.status === 'successful' || charge.status === 'failed') {
                const metadata = charge.metadata || {};
                const orderId = metadata.orderId;

                if (orderId) {
                    await this.updatePaymentStatus(charge.id, charge.status === 'successful' ? 'Success' : 'Failed');

                    if (charge.status === 'successful') {
                        await this.updateOrderPaid(parseInt(orderId));
                    }
                }
            }
        }
    }

    private async updatePaymentStatus(gatewayRefId: string, status: string) {
        // Find payment by gateway ref (charge id)
        const payment = await this.prisma.payment.findFirst({
            where: { gatewayRefId },
        });

        if (payment) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status, paidAt: status === 'Success' ? new Date() : undefined },
            });
        }
    }

    private async updateOrderPaid(orderId: number) {
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'Paid' },
        });
        await this.markTicketsAsSold(orderId);
    }
}
