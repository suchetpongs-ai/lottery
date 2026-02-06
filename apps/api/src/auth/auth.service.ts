import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { authenticator } from '@otplib/preset-default';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, phoneNumber, password } = registerDto;

        // ตรวจสอบว่ามีผู้ใช้ซ้ำไหม
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { phoneNumber },
                ],
            },
        });

        if (existingUser) {
            throw new ConflictException('Username or phone number already exists');
        }

        // เข้ารหัสรหัสผ่าน
        const passwordHash = await bcrypt.hash(password, 10);

        // สร้างผู้ใช้ใหม่
        const user = await this.prisma.user.create({
            data: {
                username,
                phoneNumber,
                passwordHash,
                kycStatus: 'Unverified',
            },
        });

        // สร้าง JWT Token
        const payload = { sub: user.id, username: user.username, phone: user.phoneNumber, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                kycStatus: user.kycStatus,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        };
    }

    async login(loginDto: LoginDto) {
        const { phoneNumber, password, twoFactorCode } = loginDto;

        // ค้นหาผู้ใช้
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber: phoneNumber },
                    { username: { equals: phoneNumber } },
                ],
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2FA Check
        if (user.twoFactorEnabled) {
            if (!user.twoFactorSecret) {
                // Should not happen if data integrity is maintained, but safety check
                throw new UnauthorizedException('2FA configuration error');
            }

            if (!twoFactorCode) {
                // Return a specific error indicating 2FA is required
                // Frontend should catch this and prompt for code
                throw new UnauthorizedException({
                    message: '2FA code required',
                    code: '2FA_REQUIRED'
                });
            }

            const isValid = authenticator.verify({
                token: twoFactorCode,
                secret: user.twoFactorSecret,
            });

            if (!isValid) {
                throw new UnauthorizedException('Invalid 2FA code');
            }
        }

        // สร้าง JWT Token
        const payload = { sub: user.id, username: user.username, phone: user.phoneNumber, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                kycStatus: user.kycStatus,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        };
    }

    async validateUser(userId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                phoneNumber: true,
                kycStatus: true,
                role: true,
                createdAt: true,
                twoFactorEnabled: true,
            },
        });
    }

    // --- 2FA Methods ---

    async generateTwoFactorSecret(userId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException();

        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(
            user.email || user.phoneNumber,
            'LotteryApp',
            secret
        );


        // Save secret temporarily (or overwrite existing, 2FA not enabled yet)
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: secret,
            },
        });

        const qrCodeUrl = await toDataURL(otpauthUrl);

        return {
            secret,
            qrCodeUrl,
        };
    }

    async enableTwoFactor(userId: number, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            throw new BadRequestException('2FA setup not initiated');
        }

        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });

        if (!isValid) {
            throw new BadRequestException('Invalid 2FA code');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
            },
        });

        return { message: '2FA enabled successfully' };
    }

    async disableTwoFactor(userId: number) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });

        return { message: '2FA disabled successfully' };
    }
}
