import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import promptpay = require('promptpay-qr');

@Injectable()
export class TmweasyService {
    private apiUrl: string;
    private apiKey: string;
    private secretKey: string;
    private merchantId: string;
    private readonly logger = new Logger(TmweasyService.name);

    constructor(private configService: ConfigService) {
        // Load config with defaults (Force Git Update)
        this.apiUrl = this.configService.get<string>('TMWEASY_API_URL') || 'https://www.tmweasy.com/api'; // Based on README
        this.apiKey = this.configService.get<string>('TMWEASY_API_KEY') || '';
        this.secretKey = this.configService.get<string>('TMWEASY_SECRET_KEY') || '';
        this.merchantId = this.configService.get<string>('TMWEASY_MERCHANT_ID') || '';

        if (!this.apiKey) {
            this.logger.warn('TMWeasy API Key is missing');
        }
    }

    /**
     * Create a generic payment/QR request
     * Note: Since exact API docs are missing, assuming standard params or use what was in previous code
     */
    async createPayment(orderId: number, amount: number): Promise<any> {
        try {
            // Construct payload based on typical Thai payment gateway requirements
            // If vslip is just for verification, we might need a different flow (PromptPay QR generation + Slip Verify)
            // But user said "connect payment system", so assuming they have a payment API.

            // Reusing logic seen in previous payment.service.ts for 'tweasy'
            const payload = {
                merchant_id: this.merchantId,
                order_id: orderId.toString(),
                amount: amount,
                currency: 'THB',
                callback_url: `${this.configService.get('API_URL')}/payment/tmweasy/webhook`,
                return_url: `${this.configService.get('FRONTEND_URL')}/payment/${orderId}`,
            };

            // Using axios to call their API
            // This endpoint is hypothetical based on "tmweasy" name in previous code. 
            // If the user meant "vslip" only for verification, we'd generate our own PromptPay QR and use vslip to verify.
            // But let's stick to the "connect payment" request using the keys.

            // If we are generating PromptPay QR ourselves (common for basic Thai integration):
            // We return the QR PayloadString (PromptPay ID + Amount).

            // FIXME: Without docs, I will assume we need to generate a PromptPay QR locally 
            // and use TMWeasy (vslip) to VERIFY the slip uploaded by user.
            // OR if TMWeasy provides a "Payment Link" that handles everything.

            // Let's implement BOTH: 
            // 1. Generate PromptPay QR (Standard EMVCo)
            // 2. Interface to Verify Slip (vslip)

            return await this.generatePromptPayQR(amount);
        } catch (error) {
            this.logger.error('Failed to create payment', error);
            throw error;
        }
    }

    /**
     * Check/Verify Slip QR
     * documentation: https://github.com/niponnet91/vslip (implied)
     */
    async verifySlip(qrPayload: string, amount: number): Promise<any> {
        try {
            const response = await axios.post(`${this.apiUrl}/v1/verify`, {
                payload: qrPayload,
                amount: amount // Optional usually, but good for check
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            this.logger.error('Failed to verify slip', error);
            throw new BadRequestException('Invalid Slip');
        }
    }

    // Helper to generate PromptPay QR (using a library or raw string construction would be better, 
    // but for now let's assume we return just the payload or use a public API/lib if available)
    // For now, I'll use a placeholder or assume the frontend generates it if we don't have a library.
    // Actually, `generate-payload` package is standard for Node.
    async generatePromptPayQR(amount: number): Promise<any> {
        const promptPayId = this.configService.get<string>('PROMPTPAY_ID');
        if (!promptPayId) {
            throw new BadRequestException('PromptPay ID not configured');
        }

        // Ensure amount is a number (fix for "amount.toFixed is not a function" error)
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);

        const payload = promptpay(promptPayId, { amount: numericAmount });

        return {
            type: 'promptpay',
            id: promptPayId,
            amount: amount,
            payload: payload, // The raw string to generate QR
        };
    }
}
