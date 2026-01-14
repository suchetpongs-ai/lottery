import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

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
            },
        };
    }

    async login(loginDto: LoginDto) {
        const { phoneNumber, password } = loginDto;

        // ค้นหาผู้ใช้
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

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
            },
        });
    }
}
