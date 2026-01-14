import { Controller, Post, Body, UseGuards, Request, Get, Put, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { KYCService } from './kyc.service';

@Controller('kyc')
export class KYCController {
    constructor(private kycService: KYCService) { }

    // User endpoints
    @UseGuards(JwtAuthGuard)
    @Post('send-otp')
    async sendOTP(@Request() req) {
        const user = await req.user;
        await this.kycService.sendOTP(user.phoneNumber);
        return { message: 'OTP sent' };
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-otp')
    async verifyOTP(@Request() req, @Body() body: { otp: string }) {
        const user = await req.user;
        const verified = await this.kycService.verifyOTP(user.phoneNumber, body.otp);
        return { verified };
    }

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    async uploadKYC(@Request() req, @Body() body: any) {
        await this.kycService.uploadKYC(req.user.userId, body);
        return { message: 'KYC submitted for review' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('status')
    async getKYCStatus(@Request() req) {
        const user = await req.user;
        const isVerified = await this.kycService.isVerified(user.userId);
        return { verified: isVerified, status: user.kycStatus };
    }

    // Admin endpoints
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Get('pending')
    async getPendingKYC() {
        return this.kycService.getPendingKYC();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Put(':userId/approve')
    async approveKYC(@Param('userId') userId: string, @Request() req) {
        await this.kycService.approveKYC(parseInt(userId), req.user.userId);
        return { message: 'KYC approved' };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Put(':userId/reject')
    async rejectKYC(
        @Param('userId') userId: string,
        @Body() body: { reason: string },
        @Request() req,
    ) {
        await this.kycService.rejectKYC(parseInt(userId), req.user.userId, body.reason);
        return { message: 'KYC rejected' };
    }
}
