import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) { }

    /**
     * Checkout - ฟังก์ชันหลักที่ใช้ Pessimistic Locking
     * ใช้ FOR UPDATE เพื่อล็อคสลากระหว่างทำ Transaction
     */
    async checkout(userId: number, checkoutDto: CheckoutDto) {
        const { ticketIds } = checkoutDto;

        // ใช้ interactive transaction ของ Prisma
        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Query tickets using Prisma ORM (SQLite compatible)
            const tickets = await tx.ticket.findMany({
                where: {
                    id: { in: ticketIds.map(id => BigInt(id)) },
                    status: 'Available',
                },
            });

            // 2. ตรวจสอบว่าสลากที่เลือกทั้งหมดยังว่างอยู่หรือไม่
            if (tickets.length !== ticketIds.length) {
                const foundIds = tickets.map(t => Number(t.id));
                const notFoundIds = ticketIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(
                    `Some tickets are not available: ${notFoundIds.join(', ')}`
                );
            }

            // 3. คำนวณยอดรวม
            const totalAmount = tickets.reduce((sum, ticket) => {
                return sum + Number(ticket.price);
            }, 0);

            // 4. สร้าง Order พร้อมกำหนดเวลาหมดอายุ (15 นาที)
            // 4. สร้าง Order พร้อมกำหนดเวลาหมดอายุ (15 นาที)
            const expireAt = new Date(Date.now() + 15 * 60 * 1000);

            // Manual ID generation for Order
            const maxOrderId = await tx.order.aggregate({ _max: { id: true } });
            const nextOrderId = (maxOrderId._max.id || BigInt(0)) + BigInt(1);

            const order = await tx.order.create({
                data: {
                    id: nextOrderId,
                    userId,
                    totalAmount,
                    status: 'Pending',
                    expireAt,
                },
            });

            // 5. สร้าง Order Items
            // Manual ID generation for OrderItem
            const maxItemId = await tx.orderItem.aggregate({ _max: { id: true } });
            let nextItemId = (maxItemId._max.id || BigInt(0)) + BigInt(1);

            for (const ticket of tickets) {
                await tx.orderItem.create({
                    data: {
                        id: nextItemId,
                        orderId: order.id,
                        ticketId: BigInt(ticket.id),
                        priceAtPurchase: Number(ticket.price),
                    },
                });
                nextItemId++;
            }

            // 6. อัปเดตสถานะสลากเป็น Reserved
            await tx.ticket.updateMany({
                where: {
                    id: { in: tickets.map(t => BigInt(t.id)) },
                },
                data: {
                    status: 'Reserved',
                },
            });

            // 7. คืนค่า Order พร้อมรายละเอียด
            return tx.order.findUnique({
                where: { id: order.id },
                include: {
                    items: {
                        include: {
                            ticket: true,
                        },
                    },
                },
            });
        });

        return result;
    }

    /**
     * Confirm Payment - สำหรับ Mock การชำระเงิน
     * ใน Production จริงจะถูกเรียกโดย Webhook จาก Payment Gateway
     */
    async confirmPayment(orderId: number) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Find Order using Prisma ORM (SQLite compatible)
            const order = await tx.order.findUnique({
                where: { id: BigInt(orderId) },
                include: { items: true },
            });

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            // 2. Idempotency Check
            if (order.status === 'Paid') {
                return { message: 'Payment already processed' };
            }

            // 3. ตรวจสอบว่าหมดเวลาหรือยัง
            if (order.status === 'Expired') {
                throw new BadRequestException('Order has expired');
            }

            // 4. อัปเดต Order
            await tx.order.update({
                where: { id: BigInt(orderId) },
                data: {
                    status: 'Paid',
                },
            });

            // 5. อัปเดต Tickets จาก Reserved -> Sold (SQLite compatible)
            const ticketIds = order.items.map(item => item.ticketId);
            await tx.ticket.updateMany({
                where: {
                    id: { in: ticketIds },
                },
                data: {
                    status: 'Sold',
                },
            });

            // 6. บันทึก Payment
            // Manual ID generation for Payment
            const maxPaymentId = await tx.payment.aggregate({ _max: { id: true } });
            const nextPaymentId = (maxPaymentId._max.id || BigInt(0)) + BigInt(1);

            await tx.payment.create({
                data: {
                    id: nextPaymentId,
                    orderId: BigInt(orderId),
                    amount: order.totalAmount,
                    method: 'Mock',
                    status: 'Success',
                    paidAt: new Date(),
                },
            });

            return { message: 'Payment confirmed successfully' };
        });
    }

    /**
     * Get order details
     */
    async getOrder(orderId: number, userId: number) {
        const order = await this.prisma.order.findFirst({
            where: {
                id: BigInt(orderId),
                userId,
            },
            include: {
                items: {
                    include: {
                        ticket: {
                            include: {
                                round: true,
                            },
                        },
                    },
                },
                payments: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    /**
     * Get user orders
     */
    async getUserOrders(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        ticket: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get order statistics (สำหรับ Admin Dashboard)
     */
    async getOrderStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const [totalSales, pending, salesToday, salesYesterday] = await Promise.all([
            this.prisma.order.aggregate({
                where: { status: 'Paid' },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.count({ where: { status: 'Pending' } }),
            this.prisma.order.aggregate({
                where: { status: 'Paid', createdAt: { gte: today } },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.aggregate({
                where: { status: 'Paid', createdAt: { gte: yesterday, lt: today } },
                _sum: { totalAmount: true },
            }),
        ]);

        return {
            totalSales: totalSales._sum.totalAmount || 0,
            pending,
            salesToday: salesToday._sum?.totalAmount || 0,
            salesYesterday: salesYesterday._sum?.totalAmount || 0,
        };
    }

    /**
     * Cancel expired orders (สำหรับ Cron Job)
     */
    async cancelExpiredOrders() {
        const now = new Date();

        return this.prisma.$transaction(async (tx) => {
            // 1. หา Orders ที่หมดเวลา
            const expiredOrders = await tx.order.findMany({
                where: {
                    status: 'Pending',
                    expireAt: {
                        lt: now,
                    },
                },
            });

            if (expiredOrders.length === 0) {
                return { cancelledCount: 0 };
            }

            const expiredOrderIds = expiredOrders.map(o => o.id);

            // 2. อัปเดตสถานะ Order
            await tx.order.updateMany({
                where: {
                    id: { in: expiredOrderIds },
                },
                data: {
                    status: 'Expired',
                },
            });

            // 3. ปลดล็อคสลากกลับเป็น Available (SQLite compatible)
            // Get all ticket IDs from expired orders
            const orderItems = await tx.orderItem.findMany({
                where: {
                    orderId: { in: expiredOrderIds },
                },
            });
            const ticketIds = orderItems.map(item => item.ticketId);

            if (ticketIds.length > 0) {
                await tx.ticket.updateMany({
                    where: {
                        id: { in: ticketIds },
                        status: 'Reserved',
                    },
                    data: {
                        status: 'Available',
                    },
                });
            }

            return { cancelledCount: expiredOrders.length };
        });
    }
}
