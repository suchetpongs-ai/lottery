import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { CreateChargeDto, GenerateQRDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }

    /**
     * Create Tweasy payment link
     */
    @UseGuards(JwtAuthGuard)
    @Post('tweasy/create')
    async createTweasyPayment(@Body() dto: { orderId: number; amount: number }) {
        const result = await this.paymentService.createTweasyPayment({
            orderId: dto.orderId,
            amount: dto.amount,
            description: `คำสั่งซื้อสลาก #${dto.orderId}`,
        });
        return result;
    }

    /**
     * Tweasy webhook endpoint
     */
    @Post('tweasy/webhook')
    async handleTweasyWebhook(@Body() payload: any) {
        await this.paymentService.handleTweasyWebhook(payload);
        return { received: true };
    }

    // Legacy endpoints (kept for backward compatibility)
    @UseGuards(JwtAuthGuard)
    @Post('promptpay/generate-qr')
    async generatePromptPayQR(@Body() dto: GenerateQRDto) {
        // This endpoint is deprecated, redirecting to Tweasy
        console.log('PromptPay endpoint called, using Tweasy instead');
        return this.createTweasyPayment({ orderId: dto.orderId, amount: dto.amount });
    }

    @UseGuards(JwtAuthGuard)
    @Post('credit-card/charge')
    async createCreditCardCharge(@Body() dto: CreateChargeDto) {
        // This endpoint is deprecated, redirecting to Tweasy
        console.log('Credit card endpoint called, using Tweasy instead');
        return this.createTweasyPayment({ orderId: dto.orderId, amount: dto.amount });
    }

    @Post('webhook/omise')
    async handleOmiseWebhook(@Body() payload: any) {
        console.log('Omise webhook (deprecated)');
        return { received: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post('refund/:orderId')
    async refundPayment(@Param('orderId') orderId: string) {
        await this.paymentService.refundPayment(parseInt(orderId));
        return { success: true };
    }
}
