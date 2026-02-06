import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get dashboard summary stats
     */
    async getDashboardStats() {
        // Current day stats (real-time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalSales, activeUsers, totalOrders] = await Promise.all([
            this.prisma.order.aggregate({
                where: {
                    status: 'Paid',
                    createdAt: { gte: today },
                },
                _sum: { totalAmount: true },
            }),
            this.prisma.user.count({
                where: {
                    lastLoginAt: { gte: today },
                },
            }),
            this.prisma.order.count({
                where: {
                    createdAt: { gte: today },
                },
            }),
        ]);

        // Fetch historical trends (last 7 days) from Analytics table
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesTrend = await this.prisma.analytics.findMany({
            where: {
                metric: 'daily_sales',
                date: { gte: sevenDaysAgo },
            },
            orderBy: { date: 'asc' },
        });

        return {
            today: {
                sales: totalSales._sum.totalAmount || 0,
                activeUsers,
                totalOrders,
            },
            trends: {
                sales: salesTrend,
            },
        };
    }

    /**
     * Daily Cron Job to aggregate stats
     * Runs at midnight every day
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyStats() {
        this.logger.log('Running daily analytics aggregation...');

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        // 1. Aggregate Daily Sales
        const salesStats = await this.prisma.order.aggregate({
            where: {
                status: 'Paid',
                paidAt: {
                    gte: yesterday,
                    lte: endOfYesterday,
                },
            },
            _sum: { totalAmount: true },
        });

        const totalSales = salesStats._sum.totalAmount || 0;

        await this.prisma.analytics.upsert({
            where: {
                date_metric: {
                    date: yesterday,
                    metric: 'daily_sales',
                },
            },
            update: { value: totalSales },
            create: {
                date: yesterday,
                metric: 'daily_sales',
                value: totalSales,
            },
        });

        // 2. Aggregate Active Users
        const activeUsersCount = await this.prisma.user.count({
            where: {
                lastLoginAt: {
                    gte: yesterday,
                    lte: endOfYesterday,
                },
            },
        });

        await this.prisma.analytics.upsert({
            where: {
                date_metric: {
                    date: yesterday,
                    metric: 'active_users',
                },
            },
            update: { value: activeUsersCount },
            create: {
                date: yesterday,
                metric: 'active_users',
                value: activeUsersCount,
            },
        });

        this.logger.log(`Daily stats aggregated: Sales=${totalSales}, ActiveUsers=${activeUsersCount}`);
    }

    /**
     * Manually trigger aggregation for a specific date range (for backfilling)
     */
    async backfillStats(startDate: Date, endDate: Date) {
        // Logic to loop through dates and run aggregation
        // Simplified for now
        return { message: 'Not implemented yet' };
    }
}
