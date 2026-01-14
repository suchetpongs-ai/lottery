import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/notification.service';

@Injectable()
export class OrderScheduler {
    private readonly logger = new Logger(OrderScheduler.name);

    constructor(
        private readonly orderService: OrderService,
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredOrders() {
        this.logger.log('Running expired orders check...');

        try {
            // First, warn users about orders expiring in 30 minutes
            await this.warnExpiringOrders();

            // Then, cancel expired orders
            const result = await this.orderService.cancelExpiredOrders();

            if (result.cancelledCount > 0) {
                this.logger.warn(
                    `Cancelled ${result.cancelledCount} expired order(s).`
                );
            } else {
                this.logger.log('No expired orders found.');
            }
        } catch (error) {
            this.logger.error('Error processing expired orders:', error);
        }
    }

    private async warnExpiringOrders() {
        const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
        const now = new Date();

        const expiringOrders = await this.prisma.order.findMany({
            where: {
                status: 'Pending',
                expireAt: {
                    gte: now,
                    lte: thirtyMinutesFromNow,
                },
            },
            include: {
                items: true,
            },
        });

        for (const order of expiringOrders) {
            if (!order.expireAt) continue;

            const minutesLeft = Math.floor(
                (order.expireAt.getTime() - Date.now()) / (60 * 1000)
            );

            // Only send if exactly 30, 15, 5, or 1 minute(s) left
            if ([30, 15, 5, 1].includes(minutesLeft)) {
                await this.notificationService.createNotification(
                    order.userId,
                    NotificationType.ORDER_EXPIRING,
                    'คำสั่งซื้อใกล้หมดอายุ! ⏰',
                    `คำสั่งซื้อ #${order.id} จะหมดอายุในอีก ${minutesLeft} นาที กรุณาชำระเงินโดยเร็ว`,
                    { orderId: Number(order.id), minutesLeft },
                );
                this.logger.log(
                    `Warned user ${order.userId} about order ${order.id} expiring in ${minutesLeft} minutes`
                );
            }
        }
    }

    // Optional: Run at specific times for reporting
    @Cron('0 0 * * *') // Every day at midnight
    async dailyReport() {
        this.logger.log('Running daily report...');
        // You can add daily statistics here
    }
}
