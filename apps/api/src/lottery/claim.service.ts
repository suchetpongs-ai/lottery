import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/notification.service';

@Injectable()
export class ClaimService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
    ) { }

    async createClaim(userId: number, ticketId: number) {
        // Find ticket and verify ownership
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: BigInt(ticketId) },
            include: {
                orderItems: {
                    include: {
                        order: true,
                    },
                },
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        // Check if ticket belongs to user
        const belongsToUser = ticket.orderItems.some(
            item => item.order.userId === userId && item.order.status === 'Paid',
        );

        if (!belongsToUser) {
            throw new BadRequestException('Ticket does not belong to you');
        }

        // Check if ticket has a prize
        if (!ticket.prizeAmount || Number(ticket.prizeAmount) <= 0) {
            throw new BadRequestException('This ticket has not won any prize');
        }

        // Check if claim already exists
        const existingClaim = await this.prisma.claim.findFirst({
            where: { ticketId: BigInt(ticketId) },
        });

        if (existingClaim) {
            throw new BadRequestException('Claim already exists for this ticket');
        }

        // Create claim
        const claim = await this.prisma.claim.create({
            data: {
                ticketId: BigInt(ticketId),
                userId,
                amount: ticket.prizeAmount,
            },
        });

        return claim;
    }

    async getAllClaims(status?: string) {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        return this.prisma.claim.findMany({
            where,
            include: {
                ticket: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: { claimedAt: 'desc' },
        });
    }

    async getUserClaims(userId: number) {
        return this.prisma.claim.findMany({
            where: { userId },
            include: {
                ticket: {
                    include: {
                        round: true,
                    },
                },
            },
            orderBy: { claimedAt: 'desc' },
        });
    }

    async approveClaim(claimId: number, adminId: number) {
        const claim = await this.prisma.claim.findUnique({
            where: { id: BigInt(claimId) },
            include: {
                ticket: true,
                user: true,
            },
        });

        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== 'PENDING') {
            throw new BadRequestException('Claim is not pending');
        }

        const updatedClaim = await this.prisma.claim.update({
            where: { id: BigInt(claimId) },
            data: {
                status: 'APPROVED',
                processedAt: new Date(),
                processedBy: adminId,
            },
        });

        // Notify user
        await this.notificationService.notifyClaimApproved(
            claim.userId,
            claim.ticket.number,
            Number(claim.amount),
        );

        return updatedClaim;
    }

    async rejectClaim(claimId: number, adminId: number, reason: string) {
        const claim = await this.prisma.claim.findUnique({
            where: { id: BigInt(claimId) },
            include: {
                ticket: true,
            },
        });

        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== 'PENDING') {
            throw new BadRequestException('Claim is not pending');
        }

        const updatedClaim = await this.prisma.claim.update({
            where: { id: BigInt(claimId) },
            data: {
                status: 'REJECTED',
                processedAt: new Date(),
                processedBy: adminId,
                rejectionReason: reason,
            },
        });

        // Notify user
        await this.notificationService.notifyClaimRejected(
            claim.userId,
            claim.ticket.number,
            reason,
        );

        return updatedClaim;
    }

    async markAsPaid(claimId: number, adminId: number) {
        const claim = await this.prisma.claim.findUnique({
            where: { id: BigInt(claimId) },
            include: {
                ticket: true,
            },
        });

        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== 'APPROVED') {
            throw new BadRequestException('Claim must be approved before marking as paid');
        }

        const updatedClaim = await this.prisma.claim.update({
            where: { id: BigInt(claimId) },
            data: {
                status: 'PAID',
                processedAt: new Date(),
                processedBy: adminId,
            },
        });

        // Notify user
        await this.notificationService.notifyClaimPaid(
            claim.userId,
            claim.ticket.number,
            Number(claim.amount),
        );

        return updatedClaim;
    }
}
