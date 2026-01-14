import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchTicketsDto, CreateRoundDto } from './dto/lottery.dto';

@Injectable()
export class LotteryService {
    constructor(private prisma: PrismaService) { }

    // ค้นหาสลาก
    async searchTickets(searchDto: SearchTicketsDto) {
        const { number, roundId, searchType = 'exact', page = 1, limit = 20 } = searchDto;

        const skip = (page - 1) * limit;

        // สร้าง where condition
        const where: any = {
            status: 'Available', // ดึงเฉพาะสลากที่ว่าง
        };

        // ถ้าระบุงวด
        if (roundId) {
            where.roundId = roundId;
        } else {
            // ถ้าไม่ระบุงวด ใช้งวดล่าสุดที่เปิดขาย
            const activeRound = await this.prisma.round.findFirst({
                where: { status: 'Open' },
                orderBy: { drawDate: 'desc' },
            });

            if (activeRound) {
                where.roundId = activeRound.id;
            }
        }

        // ถ้าระบุเลข ให้ค้นหาตามประเภท
        if (number) {
            if (searchType === 'exact') {
                where.number = number;
            } else if (searchType === 'prefix') {
                where.number = { startsWith: number };
            } else if (searchType === 'suffix') {
                where.number = { endsWith: number };
            }
        }

        const [tickets, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                include: {
                    round: true,
                },
                skip,
                take: limit,
                orderBy: { number: 'asc' },
            }),
            this.prisma.ticket.count({ where }),
        ]);

        return {
            data: tickets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ดึงรายละเอียดสลาก
    async getTicketById(ticketId: number) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: BigInt(ticketId) },
            include: {
                round: true,
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        return ticket;
    }

    // สร้างงวดใหม่
    async createRound(createRoundDto: CreateRoundDto) {
        const round = await this.prisma.round.create({
            data: {
                name: createRoundDto.name || `งวดวันที่ ${createRoundDto.drawDate}`,
                drawDate: createRoundDto.drawDate,
                openSellingAt: createRoundDto.openSellingAt,
                closeSellingAt: createRoundDto.closeSellingAt || new Date(new Date(createRoundDto.drawDate).getTime() - 24 * 60 * 60 * 1000), // 1 day before draw
                status: 'OPEN',
            },
        });
        return round;
    }

    async getCurrentRound() {
        const round = await this.prisma.round.findFirst({
            where: { status: 'Open' },
            orderBy: { drawDate: 'desc' },
        });

        if (!round) {
            throw new NotFoundException('No active round found');
        }

        return round;
    }

    // ดึงประวัติผลรางวัล
    async getPastRounds() {
        return this.prisma.round.findMany({
            where: {
                // winningNumbers should be not null, or status DRAWN/CLOSED
                // Let's assume DRAWN status implies results are present
                status: 'DRAWN',
            },
            orderBy: { drawDate: 'desc' },
            take: 12, // Last 12 rounds
        });
    }

    // ปิดงวด
    async closeRound(roundId: number) {
        return this.prisma.round.update({
            where: { id: roundId },
            data: { status: 'Closed' },
        });
    }

    // สถิติสลาก (สำหรับ Admin Dashboard)
    async getTicketStats() {
        const [sold, available, activeRounds] = await Promise.all([
            this.prisma.ticket.count({ where: { status: 'Sold' } }),
            this.prisma.ticket.count({ where: { status: 'Available' } }),
            this.prisma.round.count({ where: { status: 'Open' } }),
        ]);

        return { sold, available, activeRounds };
    }

    // เพิ่มสลากเข้าระบบ (สำหรับ Admin)
    async addTickets(roundId: number, tickets: { number: string; price: number; setSize: number; imageUrl?: string }[]) {
        const ticketsData = tickets.map(t => ({
            roundId,
            number: t.number,
            price: t.price,
            setSize: t.setSize,
            imageUrl: t.imageUrl,
            status: 'Available',
        }));

        // ใช้ loop insert แทน createMany เพื่อป้องกันปัญหา autoincrement กับ BigInt บน LibSQL adapter
        let count = 0;
        for (const data of ticketsData) {
            await this.prisma.ticket.create({ data });
            count++;
        }

        return { message: `Added ${count} tickets successfully` };
    }
}
