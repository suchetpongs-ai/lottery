import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
    NEW_ROUND = 'NEW_ROUND',
    PRIZE_WIN = 'PRIZE_WIN',
    CLAIM_APPROVED = 'CLAIM_APPROVED',
    CLAIM_REJECTED = 'CLAIM_REJECTED',
    CLAIM_PAID = 'CLAIM_PAID',
    ORDER_EXPIRING = 'ORDER_EXPIRING',
}

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    async createNotification(
        userId: number,
        type: NotificationType,
        title: string,
        message: string,
        data?: any,
    ) {
        return this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                // data field does not exist in schema
            },
        });
    }

    async getUserNotifications(userId: number, limit: number = 20) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getUnreadCount(userId: number) {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }

    async markAsRead(notificationId: number, userId: number) {
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
            },
            data: {
                read: true,
            },
        });
    }

    async markAllAsRead(userId: number) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
    }

    // Helper methods for creating specific notification types
    async notifyNewRound(userId: number, roundName: string, roundId: number) {
        return this.createNotification(
            userId,
            NotificationType.NEW_ROUND,
            'งวดใหม่เปิดขายแล้ว! 🎰',
            `${roundName} เปิดให้ซื้อสลากแล้ว`,
            { roundId },
        );
    }

    async notifyPrizeWin(
        userId: number,
        ticketNumber: string,
        prizeTier: string,
        prizeAmount: number,
    ) {
        return this.createNotification(
            userId,
            NotificationType.PRIZE_WIN,
            'ยินดีด้วย! คุณถูกรางวัล! 🎉',
            `สลากหมายเลข ${ticketNumber} ถูก${prizeTier} รางวัล ${prizeAmount.toLocaleString()} บาท`,
            { ticketNumber, prizeTier, prizeAmount },
        );
    }

    async notifyClaimApproved(userId: number, ticketNumber: string, amount: number) {
        return this.createNotification(
            userId,
            NotificationType.CLAIM_APPROVED,
            'อนุมัติการรับเงินรางวัลแล้ว ✅',
            `การขอรับเงินรางวัลสลาก ${ticketNumber} จำนวน ${amount.toLocaleString()} บาท ได้รับการอนุมัติแล้ว`,
            { ticketNumber, amount },
        );
    }

    async notifyClaimRejected(
        userId: number,
        ticketNumber: string,
        reason: string,
    ) {
        return this.createNotification(
            userId,
            NotificationType.CLAIM_REJECTED,
            'การรับเงินรางวัลถูกปฏิเสธ ❌',
            `การขอรับเงินรางวัลสลาก ${ticketNumber} ถูกปฏิเสธ: ${reason}`,
            { ticketNumber, reason },
        );
    }

    async notifyClaimPaid(userId: number, ticketNumber: string, amount: number) {
        return this.createNotification(
            userId,
            NotificationType.CLAIM_PAID,
            'โอนเงินรางวัลแล้ว 💰',
            `โอนเงินรางวัลสลาก ${ticketNumber} จำนวน ${amount.toLocaleString()} บาท เข้าบัญชีของคุณแล้ว`,
            { ticketNumber, amount },
        );
    }
}
