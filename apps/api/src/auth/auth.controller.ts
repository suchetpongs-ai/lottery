import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/setup')
    async setupTwoFactor(@Request() req) {
        return this.authService.generateTwoFactorSecret(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/enable')
    async enableTwoFactor(@Request() req, @Body() body: { code: string }) {
        return this.authService.enableTwoFactor(req.user.userId, body.code);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/disable')
    async disableTwoFactor(@Request() req) {
        return this.authService.disableTwoFactor(req.user.userId);
    }
}
