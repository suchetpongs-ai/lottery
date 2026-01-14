import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SMSOptions {
    to: string;
    message: string;
}

@Injectable()
export class SMSService {
    private twilioClient: any; // Will initialize when Twilio is installed

    constructor(private configService: ConfigService) {
        // For production, install: npm install twilio
        // Then uncomment:
        // const twilio = require('twilio');
        // this.twilioClient = twilio(
        //   this.configService.get('TWILIO_ACCOUNT_SID'),
        //   this.configService.get('TWILIO_AUTH_TOKEN')
        // );
    }

    async sendSMS(options: SMSOptions): Promise<void> {
        try {
            // Mock implementation for development
            console.log(`[SMS Mock] To: ${options.to}, Message: ${options.message}`);

            // Production implementation (uncomment when ready):
            // await this.twilioClient.messages.create({
            //   body: options.message,
            //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
            //   to: options.to,
            // });

        } catch (error) {
            console.error('Failed to send SMS:', error);
            // Don't throw - SMS failure shouldn't break the application
        }
    }

    // Template methods for specific SMS
    async sendOTP(phoneNumber: string, otp: string) {
        await this.sendSMS({
            to: phoneNumber,
            message: `รหัส OTP ของคุณคือ: ${otp} (ใช้ได้ 5 นาที)`,
        });
    }

    async sendPrizeWinSMS(phoneNumber: string, ticketNumber: string, amount: number) {
        await this.sendSMS({
            to: phoneNumber,
            message: `🎉 ยินดีด้วย! สลาก ${ticketNumber} ถูกรางวัล ฿${amount.toLocaleString()}! เข้าสู่ระบบเพื่อขอรับเงิน`,
        });
    }

    async sendClaimApprovedSMS(phoneNumber: string, amount: number) {
        await this.sendSMS({
            to: phoneNumber,
            message: `✅ อนุมัติการรับเงินรางวัล ฿${amount.toLocaleString()} แล้ว! จะโอนเข้าบัญชีภายใน 3-5 วัน`,
        });
    }

    async sendNewRoundSMS(phoneNumber: string, roundName: string) {
        await this.sendSMS({
            to: phoneNumber,
            message: `🎰 ${roundName} เปิดขายแล้ว! รีบซื้อเลย!`,
        });
    }
}
