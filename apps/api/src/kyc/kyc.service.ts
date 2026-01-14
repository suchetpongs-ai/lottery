import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SMSService } from '../common/sms.service';
import { ConfigService } from '@nestjs/config';

export interface UploadKYCDto {
    idCardImage: string; // Base64 or file path
    selfieImage?: string;
    address?: string;
}

@Injectable()
export class KYCService {
    private otpStore = new Map<string, { otp: string; expiresAt: Date }>();

    constructor(
        private prisma: PrismaService,
        private smsService: SMSService,
        private configService: ConfigService,
    ) { }

    /**
     * Send OTP to phone number for verification
     */
    async sendOTP(phoneNumber: string): Promise<void> {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 5 minute expiration
        this.otpStore.set(phoneNumber, {
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        // Send via SMS
        await this.smsService.sendOTP(phoneNumber, otp);

        console.log(`[KYC] OTP sent to ${phoneNumber}: ${otp}`); // Remove in production
    }

    /**
     * Verify OTP
     */
    async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
        const stored = this.otpStore.get(phoneNumber);

        if (!stored) {
            throw new BadRequestException('OTP not found or expired');
        }

        if (new Date() > stored.expiresAt) {
            this.otpStore.delete(phoneNumber);
            throw new BadRequestException('OTP expired');
        }

        if (stored.otp !== otp) {
            throw new BadRequestException('Invalid OTP');
        }

        // OTP verified, remove from store
        this.otpStore.delete(phoneNumber);
        return true;
    }

    /**
     * Upload KYC documents
     */
    async uploadKYC(userId: number, data: UploadKYCDto): Promise<void> {
        // In production, upload images to S3/Cloud Storage
        // For now, store paths in database

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if already verified
        if (user.kycStatus === 'Verified') {
            throw new BadRequestException('User already verified');
        }

        // Store KYC data (would create separate KYC table in production)
        // For now, just update user status to Pending
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: 'Pending', // Pending admin review
            },
        });

        console.log(`[KYC] Documents uploaded for user ${userId}`);
    }

    /**
     * Admin: Get all pending KYC submissions
     */
    async getPendingKYC() {
        return this.prisma.user.findMany({
            where: {
                kycStatus: 'Pending',
            },
            select: {
                id: true,
                username: true,
                phoneNumber: true,
                kycStatus: true,
                createdAt: true,
            },
        });
    }

    /**
     * Admin: Approve KYC
     */
    async approveKYC(userId: number, adminId: number): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.kycStatus !== 'Pending') {
            throw new BadRequestException('User KYC is not pending');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: 'Verified',
            },
        });

        console.log(`[KYC] User ${userId} verified by admin ${adminId}`);

        // TODO: Send notification to user
    }

    /**
     * Admin: Reject KYC
     */
    async rejectKYC(userId: number, adminId: number, reason: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.kycStatus !== 'Pending') {
            throw new BadRequestException('User KYC is not pending');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: 'Rejected',
            },
        });

        console.log(`[KYC] User ${userId} rejected by admin ${adminId}: ${reason}`);

        // TODO: Send notification to user with reason
    }

    /**
     * Check if user is verified
     */
    async isVerified(userId: number): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { kycStatus: true },
        });

        return user?.kycStatus === 'Verified';
    }
}
