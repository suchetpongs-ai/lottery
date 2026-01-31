import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BanUserDto, UserFilterDto } from './dto/user.dto';

@Injectable()
export class UserManagementService {
    constructor(private prisma: PrismaService) { }

    async findAll(filter: UserFilterDto) {
        const { search, isBanned, page = 1, limit = 20 } = filter;

        const where: any = {};

        if (search) {
            where.OR = [
                { username: { contains: search } },
                { phoneNumber: { contains: search } },
            ];
        }

        if (isBanned !== undefined) {
            where.isBanned = isBanned;
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    phoneNumber: true,
                    createdAt: true,
                    isBanned: true,
                    bannedAt: true,
                    bannedReason: true,
                    _count: {
                        select: {
                            orders: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async banUser(userId: number, reason: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        if (user.isBanned) {
            throw new Error('User is already banned');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: true,
                bannedAt: new Date(),
                bannedReason: reason,
            },
        });
    }

    async unbanUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        if (!user.isBanned) {
            throw new Error('User is not banned');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: false,
                bannedAt: null,
                bannedReason: null,
            },
        });
    }
    async updateUserRole(userId: number, role: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    async getUserStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, newToday] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { createdAt: { gte: today } } }),
        ]);

        return { total, newToday };
    }
}
