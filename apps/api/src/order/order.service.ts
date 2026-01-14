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
            // 1. ล็อคและตรวจสอบสลากทั้งหมด (FOR UPDATE)
            const tickets = await tx.$queryRaw<any[]>`
        SELECT * FROM tickets 
        WHERE id = ANY(${ticketIds}) AND status = 'Available'
        FOR UPDATE
      `;

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
                return sum + parseFloat(ticket.price);
            }, 0);

            // 4. สร้าง Order พร้อมกำหนดเวลาหมดอายุ (15 นาที)
            const expireAt = new Date(Date.now() + 15 * 60 * 1000);

            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: 'Pending',
                    expireAt,
                },
            });

            // 5. สร้าง Order Items
            const orderItems = tickets.map(ticket => ({
                orderId: order.id,
                ticketId: BigInt(ticket.id),
                priceAtPurchase: parseFloat(ticket.price),
            }));

            await tx.orderItem.createMany({
                data: orderItems,
            });

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
            // 1. Lock Order
            const orderRes = await tx.$queryRaw<any[]>`
        SELECT * FROM orders WHERE id = ${orderId} FOR UPDATE
      `;

            if (orderRes.length === 0) {
                throw new NotFoundException('Order not found');
            }

            const order = orderRes[0];

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
                where: { id: orderId },
                data: {
                    status: 'Paid',
                },
            });

            // 5. อัปเดต Tickets จาก Reserved -> Sold
            await tx.$executeRaw`
        UPDATE tickets 
        SET status = 'Sold' 
        FROM order_items 
        WHERE tickets.id = order_items.ticket_id 
        AND order_items.order_id = ${orderId}
      `;

            // 6. บันทึก Payment
            await tx.payment.create({
                data: {
                    orderId: BigInt(orderId),
                    amount: order.total_amount,
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
        const [totalSales, pending] = await Promise.all([
            this.prisma.order.aggregate({
                where: { status: 'Paid' },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.count({ where: { status: 'Pending' } }),
        ]);

        return {
            totalSales: totalSales._sum.totalAmount || 0,
            pending,
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

            // 3. ปลดล็อคสลากกลับเป็น Available
            await tx.$executeRaw`
        UPDATE tickets 
        SET status = 'Available' 
        FROM order_items 
        WHERE tickets.id = order_items.ticket_id 
        AND order_items.order_id = ANY(${expiredOrderIds})
        AND tickets.status = 'Reserved'
      `;

            return { cancelledCount: expiredOrders.length };
        });
    }
}
