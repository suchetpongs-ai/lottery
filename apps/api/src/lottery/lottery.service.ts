import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchTicketsDto, CreateRoundDto } from './dto/lottery.dto';
// import { RoundStatus, TicketStatus } from '@prisma/client'; // Enums not defined in schema

export const RoundStatus = {
    UPCOMING: 'UPCOMING',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    DRAWN: 'DRAWN',
    ARCHIVED: 'ARCHIVED',
};

export const TicketStatus = {
    Available: 'Available',
    Reserved: 'Reserved',
    Sold: 'Sold',
    Cancelled: 'Cancelled',
};

@Injectable()
export class LotteryService {
    constructor(private prisma: PrismaService) { }

    // ค้นหาสลาก
    async searchTickets(searchDto: SearchTicketsDto) {
        const { number, roundId, searchType = 'exact', page = 1, limit = 20 } = searchDto;

        const skip = (page - 1) * limit;

        // Common where conditions
        let where: any = {
            status: TicketStatus.Available,
        };

        // Round ID logic
        if (roundId) {
            where.roundId = roundId;
        } else {
            const activeRound = await this.prisma.round.findFirst({
                where: { status: RoundStatus.OPEN },
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
        const drawDate = new Date(createRoundDto.drawDate);
        const openSellingAt = new Date(createRoundDto.openSellingAt);
        const closeSellingAt = createRoundDto.closeSellingAt
            ? new Date(createRoundDto.closeSellingAt)
            : new Date(drawDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before draw

        const round = await this.prisma.round.create({
            data: {
                name: createRoundDto.name || `งวดวันที่ ${createRoundDto.drawDate}`,
                drawDate,
                openSellingAt,
                closeSellingAt,
                status: RoundStatus.OPEN, // Use 'OPEN' to match getCurrentRound filter
            },
        });
        return round;
    }

    async getCurrentRound() {
        const round = await this.prisma.round.findFirst({
            where: { status: RoundStatus.OPEN },
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
                status: RoundStatus.DRAWN,
            },
            orderBy: { drawDate: 'desc' },
            take: 12, // Last 12 rounds
        });
    }

    // ปิดงวด
    async closeRound(roundId: number) {
        return this.prisma.round.update({
            where: { id: roundId },
            data: { status: RoundStatus.CLOSED },
        });
    }

    // สถิติสลาก (สำหรับ Admin Dashboard)
    async getTicketStats() {
        const [sold, available, activeRounds] = await Promise.all([
            this.prisma.ticket.count({ where: { status: TicketStatus.Sold } }),
            this.prisma.ticket.count({ where: { status: TicketStatus.Available } }),
            this.prisma.round.count({ where: { status: RoundStatus.OPEN } }),
        ]);

        return { sold, available, activeRounds };
    }

    // เพิ่มสลากเข้าระบบ (สำหรับ Admin)
    async addTickets(roundId: number, tickets: { number: string; price: number; setSize: number; imageUrl?: string }[]) {
        // LibSQL adapter doesn't auto-generate BigInt IDs, so we need to generate them manually
        // Get the current max ID
        const maxIdResult = await this.prisma.ticket.aggregate({
            _max: { id: true }
        });
        let nextId = (maxIdResult._max.id || BigInt(0)) + BigInt(1);

        let count = 0;
        for (const t of tickets) {
            await this.prisma.ticket.create({
                data: {
                    id: nextId,
                    roundId,
                    number: t.number,
                    price: t.price,
                    setSize: t.setSize,
                    imageUrl: t.imageUrl,
                    status: TicketStatus.Available,
                },
            });
            nextId++;
            count++;
        }

        return { message: `Added ${count} tickets successfully` };
    }

    // Admin: Get tickets by round with pagination
    async getTicketsByRound(roundId: number, page: number = 1, limit: number = 50, search?: string) {
        const skip = (page - 1) * limit;
        const where: any = { roundId };

        if (search) {
            where.number = { contains: search };
        }

        const [tickets, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
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

    // Admin: Update ticket
    async updateTicket(id: number, data: any, adminId?: number) {
        // Check lock if adminId is provided
        if (adminId) {
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: BigInt(id) },
                select: { lockedBy: true, lockedAt: true }
            });

            if (ticket?.lockedBy && ticket.lockedBy !== adminId) {
                // Check expiration (e.g. 5 mins)
                const lockTime = ticket.lockedAt ? new Date(ticket.lockedAt).getTime() : 0;
                const now = new Date().getTime();
                if (ticket.lockedAt && now - lockTime < 5 * 60 * 1000) {
                    throw new BadRequestException(`Ticket is currently edited by another admin (ID: ${ticket.lockedBy})`);
                }
            }
        }

        const updated = await this.prisma.ticket.update({
            where: { id: BigInt(id) },
            data,
        });

        // Auto-unlock after update
        if (adminId) {
            await this.unlockTicket(id, adminId);
        }

        return updated;
    }

    // Admin: Lock ticket for editing
    async lockTicket(id: number, adminId: number) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: BigInt(id) },
        });

        if (!ticket) throw new NotFoundException('Ticket not found');

        // Check if already locked by someone else
        if (ticket.lockedBy && ticket.lockedBy !== adminId) {
            const lockTime = ticket.lockedAt ? new Date(ticket.lockedAt).getTime() : 0;
            const now = new Date().getTime();
            if (ticket.lockedAt && now - lockTime < 5 * 60 * 1000) { // 5 minutes lock
                throw new BadRequestException(`Ticket is currently locked by another admin (ID: ${ticket.lockedBy})`);
            }
        }

        return this.prisma.ticket.update({
            where: { id: BigInt(id) },
            data: {
                lockedBy: adminId,
                lockedAt: new Date(),
            },
        });
    }

    // Admin: Unlock ticket
    async unlockTicket(id: number, adminId: number) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: BigInt(id) },
        });

        if (!ticket) throw new NotFoundException('Ticket not found');

        // Only locker or super admin can unlock (simpler logic: only locker for now)
        if (ticket.lockedBy && ticket.lockedBy !== adminId) {
            // Optional: Allow force unlock if expired
            const lockTime = ticket.lockedAt ? new Date(ticket.lockedAt).getTime() : 0;
            const now = new Date().getTime();
            if (ticket.lockedAt && now - lockTime < 5 * 60 * 1000) {
                throw new BadRequestException('Cannot unlock ticket locked by another admin');
            }
        }

        return this.prisma.ticket.update({
            where: { id: BigInt(id) },
            data: {
                lockedBy: null,
                lockedAt: null,
            },
        });
    }

    // Admin: Delete ticket
    async deleteTicket(id: number) {
        // Check if ticket is sold orders
        // (Optional: Prevent deletion if already bought)
        return this.prisma.ticket.delete({
            where: { id: BigInt(id) },
        });
    }
}
