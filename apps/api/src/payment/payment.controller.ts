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
        return this.paymentService.createOmisePromptPay({
            orderId: dto.orderId,
            amount: dto.amount,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('tmweasy/create') // PromptPay
    async createTmweasyPayment(@Body() dto: { orderId: number; amount: number }) {
        return this.paymentService.createTmweasyPromptPay(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('tmweasy/verify-slip')
    async verifySlip(@Body() dto: { orderId: number; qrPayload: string }) {
        return this.paymentService.verifySlipQr(dto.qrPayload, dto.orderId);
    }

    @Post('tmweasy/webhook')
    async handleTmweasyWebhook(@Body() payload: any) {
        // Reuse webhook logic or implement specific TMWeasy one if different
        // this.paymentService.handleTweasyWebhook(payload); 
        return { received: true };
    }

    // Keeping Omise endpoints for reference or fallback if needed, but primary is now TMWeasy
    @UseGuards(JwtAuthGuard)
    @Post('credit-card/charge')
    async createCreditCardCharge(@Body() dto: CreateChargeDto) {
        return this.paymentService.createOmiseCharge(dto);
    }

    @Post('webhook/omise')
    async handleOmiseWebhook(@Body() payload: any) {
        await this.paymentService.handleOmiseWebhook(payload);
        return { received: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post('refund/:orderId')
    async refundPayment(@Param('orderId') orderId: string) {
        await this.paymentService.refundPayment(parseInt(orderId));
        return { success: true };
    }
}
