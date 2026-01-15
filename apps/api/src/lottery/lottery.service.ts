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

        // Common where conditions
        let where: any = {
            status: 'Available',
        };

        // Round ID logic
        if (roundId) {
            where.roundId = roundId;
        } else {
            const activeRound = await this.prisma.round.findFirst({
                where: { status: 'Open' },
                orderBy: { drawDate: 'desc' },
            });

            if (activeRound) {
                where.roundId = activeRound.id;
            }
        }

        // Search logic
        if (number) {
            // Check if number contains wildcards (underscores or empty positions passed as underscores)
            if (number.includes('_')) {
                // Use Raw SQL for pattern matching with LIKE operator
                // Note: We use Prisma's raw query to leverage specific database capabilities if needed,
                // but standard SQL LIKE works for both SQLite and Postgres with '_' wildcard.
                const pattern = number; // e.g. "1_2__6"

                // We need to query IDs first because relation inclusion in raw query is complex
                // Assuming table names match model names but are mapped? Prisma standard is PascalCase usually unless mapped.
                // Let's rely on standard 'Ticket' table. If mapping exists, it might be different.
                // To be safe, we can try to use prisma.ticket.findMany with a raw WHERE clause if possible, but it's not.
                // Alternatively, fetch IDs via raw query.

                // Construct the raw query.
                // We also need to filter by status and roundId which we already determined.
                // BigInt handling: queryRaw returns serialized BigInts usually.

                const roundIdVal = where.roundId;

                // Use a direct query for IDs first
                const matchingIds = await this.prisma.$queryRaw<{ id: bigint }[]>`
                    SELECT id FROM "Ticket" 
                    WHERE status = 'Available' 
                    AND "roundId" = ${roundIdVal}
                    AND number LIKE ${pattern}
                    ORDER BY number ASC
                    LIMIT ${limit} OFFSET ${skip}
                `;

                const totalCountResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
                    SELECT COUNT(*) as count FROM "Ticket" 
                    WHERE status = 'Available' 
                    AND "roundId" = ${roundIdVal}
                    AND number LIKE ${pattern}
                `;

                const total = Number(totalCountResult[0]?.count || 0);

                // Now fetch the full entities with relations using standard Prisma
                const ids = matchingIds.map(r => r.id);

                const tickets = await this.prisma.ticket.findMany({
                    where: { id: { in: ids } },
                    include: { round: true },
                    orderBy: { number: 'asc' }
                });

                return {
                    data: tickets,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                };

            } else {
                // Standard search (Exact/Prefix/Suffix)
                if (searchType === 'exact') {
                    where.number = number;
                } else if (searchType === 'prefix') {
                    where.number = { startsWith: number };
                } else if (searchType === 'suffix') {
                    where.number = { endsWith: number };
                }
            }
        }

        // Execute standard query if not wildcard
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
