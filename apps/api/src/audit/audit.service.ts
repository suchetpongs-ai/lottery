import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Log an action
     */
    async log(
        action: string,
        resource: string,
        resourceId: string | number | null,
        userId: number | null,
        changes?: any,
        metadata?: { ipAddress?: string; userAgent?: string }
    ) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    action,
                    resource,
                    resourceId: resourceId ? String(resourceId) : null,
                    userId,
                    changes: changes ? (typeof changes === 'object' ? changes : { value: changes }) : undefined,
                    ipAddress: metadata?.ipAddress,
                    userAgent: metadata?.userAgent,
                },
            });
        } catch (error) {
            // Should not throw error to prevent blocking main flow
            this.logger.error(`Failed to create audit log for ${action}`, error);
        }
    }

    /**
     * Get logs (Admin)
     */
    async getLogs(page = 1, limit = 20, userId?: number, action?: string) {
        const where: any = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            role: true,
                        },
                    },
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
