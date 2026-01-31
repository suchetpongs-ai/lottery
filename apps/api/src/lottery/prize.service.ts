import { Injectable, Logger, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/notification.service';
import { AnnounceResultsDto, CheckPrizeDto, PrizeCheckResult } from './dto/prize.dto';
// import { QueueService } from '../queue/queue.service'; // Disabled

import axios from 'axios';

@Injectable()
export class PrizeService {
    private readonly logger = new Logger(PrizeService.name); // (Force Git Update)

    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
        // QueueService disabled
    ) { }

    /**
     * Fetch valid results from external API (rayriffy/thai-lotto-api)
     */
    async fetchAndSyncResults(roundId: number) {
        const round = await this.prisma.round.findUnique({ where: { id: roundId } });
        if (!round) throw new NotFoundException('Round not found');

        // Convert Date to YYYY-MM-DD (Buddhist Era for API)
        const date = new Date(round.drawDate);
        const beYear = date.getFullYear() + 543;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${beYear}-${month}-${day}`;

        try {
            this.logger.log(`Fetching lottery results for ${dateStr}...`);
            const url = `https://lotto.api.rayriffy.com/lotto/${dateStr}`;
            const response = await axios.get(url);

            if (!response.data || !response.data.response) {
                // Try fallback to latest if date matches today? 
                // Or just error out. The API usually returns 404 if not found.
                throw new Error('API returned no data');
            }

            const data = response.data.response;
            const allPrizes = [...data.prizes, ...data.runningNumbers];

            const getNumbers = (id: string) => allPrizes.find((p: any) => p.id === id)?.number || [];

            const winningNumbers = {
                firstPrize: getNumbers('prizeFirst')[0] || '',
                nearby: getNumbers('prizeFirstNear'),
                threeDigitFront: getNumbers('runningNumberFrontThree'),
                threeDigitBack: getNumbers('runningNumberBackThree'),
                twoDigit: getNumbers('runningNumberBackTwo'),
            };

            this.logger.log(`Extracted winning numbers: ${JSON.stringify(winningNumbers)}`);

            return this.announceResults({
                roundId,
                winningNumbers,
            });

        } catch (error) {
            this.logger.error(`Failed to fetch results: ${error.message}`);
            // If specific date fails, try latest if the round is the current one?
            // For now, simple error is safer.
            throw new BadRequestException(`Could not fetch results from API for date ${dateStr}. Check if results are announced.`);
        }
    }

    /**
     * Admin announces lottery draw results
     */
    async announceResults(dto: AnnounceResultsDto) {
        this.logger.log(`Announcing results for round ${dto.roundId}`);

        // Find round
        const round = await this.prisma.round.findUnique({
            where: { id: dto.roundId },
            include: { tickets: { where: { status: 'Sold' } } },
        });

        if (!round) {
            throw new NotFoundException(`Round ${dto.roundId} not found`);
        }

        // Update round with winning numbers
        const updatedRound = await this.prisma.round.update({
            where: { id: dto.roundId },
            data: {
                winningNumbers: JSON.stringify(dto.winningNumbers),
                resultsAnnouncedAt: new Date(),
                status: 'DRAWN',
            },
        });

        // Trigger automated prize checking for all sold tickets
        this.logger.log(`Triggering prize check for ${round.tickets.length} sold tickets`);

        // Synchronously check all tickets (since queue is disabled)
        await this.checkAllTicketsForRound(dto.roundId, dto.winningNumbers);

        // TODO: Send notifications to users

        return {
            success: true,
            round: updatedRound,
            ticketsToCheck: round.tickets.length,
        };
    }

    /**
     * Check all tickets for a specific round
     */
    async checkAllTicketsForRound(roundId: number, winningNumbers: any) {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                roundId,
                status: 'Sold',
            },
            include: {
                orderItems: {
                    include: {
                        order: true,
                    },
                },
            },
        });

        this.logger.log(`Checking ${tickets.length} tickets for round ${roundId}...`);

        let winnersCount = 0;
        const notifications: Promise<any>[] = [];

        for (const ticket of tickets) {
            const result = this.calculatePrize(ticket.number, winningNumbers);

            if (result.isWinner) {
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: {
                        prizeAmount: result.prizeAmount,
                        prizeTier: result.prizeTier,
                        prizeCheckedAt: new Date(),
                    },
                });
                winnersCount++;

                // Find the owner and notify them
                const paidOrder = ticket.orderItems.find(
                    item => item.order.status === 'Paid'
                );
                if (paidOrder) {
                    notifications.push(
                        this.notificationService.notifyPrizeWin(
                            paidOrder.order.userId,
                            ticket.number,
                            result.prizeTier || '',
                            result.prizeAmount || 0,
                        )
                    );
                }
            } else {
                // Mark as checked even if lost, so we know it was processed
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: {
                        prizeCheckedAt: new Date(),
                    },
                });
            }
        }

        // Send all notifications in parallel
        await Promise.all(notifications);

        this.logger.log(`Finished checking. Found ${winnersCount} winners. Sent ${notifications.length} notifications.`);
    }

    /**
     * Check if a ticket number won any prize
     */
    async checkPrize(dto: CheckPrizeDto): Promise<PrizeCheckResult> {
        const { ticketNumber, roundId: targetRoundId } = dto;

        // Try to find ticket first (to update it if found)
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                number: ticketNumber,
                ...(targetRoundId && { roundId: targetRoundId }),
            },
            include: {
                round: true,
            },
            orderBy: {
                id: 'desc', // Get latest if multiple
            },
        });

        let round = ticket?.round || null;

        // If ticket not found, find round directly
        if (!round && targetRoundId) {
            round = await this.prisma.round.findUnique({ where: { id: targetRoundId } });
        }

        if (!round) {
            return {
                ticketNumber,
                roundName: 'ไม่พบข้อมูล',
                isWinner: false,
                message: 'ไม่พบข้อมูลสลากหรืองวดที่ระบุ',
            };
        }

        // Check if round has results
        if (!round.winningNumbers) {
            return {
                ticketNumber,
                roundName: round.name || `งวดวันที่ ${round.drawDate.toLocaleDateString('th-TH')}`,
                isWinner: false,
                message: 'งวดนี้ยังไม่ประกาศผล',
            };
        }

        // Check prize
        let winningNumbersObj = round.winningNumbers;
        if (typeof winningNumbersObj === 'string') {
            try {
                winningNumbersObj = JSON.parse(winningNumbersObj);
            } catch (e) {
                this.logger.error('Failed to parse winning numbers JSON', e);
                return {
                    ticketNumber,
                    roundName: round.name || '',
                    isWinner: false,
                    message: 'ข้อมูลรางวัลไม่ถูกต้อง',
                };
            }
        }
        const prizeResult = this.calculatePrize(ticketNumber, winningNumbersObj);

        // Update ticket if winner AND ticket exists
        if (ticket && prizeResult.isWinner) {
            await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    prizeAmount: prizeResult.prizeAmount,
                    prizeTier: prizeResult.prizeTier,
                    prizeCheckedAt: new Date(),
                },
            });

            // TODO: Create notification for user
        }

        return {
            ticketNumber,
            roundName: round.name || `งวดวันที่ ${round.drawDate.toLocaleDateString('th-TH')}`,
            ...prizeResult,
        };
    }

    /**
     * Get user's winning tickets
     */
    async getUserPrizes(userId: number) {
        const winningTickets = await this.prisma.ticket.findMany({
            where: {
                prizeAmount: { gt: 0 },
                orderItems: {
                    some: {
                        order: {
                            userId,
                            status: 'Paid',
                        },
                    },
                },
            },
            include: {
                round: true,
                claims: true,
            },
            orderBy: {
                prizeCheckedAt: 'desc',
            },
        });

        return winningTickets.map((ticket) => ({
            ticketId: Number(ticket.id),
            ticketNumber: ticket.number,
            prizeAmount: ticket.prizeAmount,
            prizeTier: ticket.prizeTier,
            roundName: ticket.round.name,
            checkedAt: ticket.prizeCheckedAt,
            claimed: ticket.claims.length > 0,
            claimStatus: ticket.claims[0]?.status,
        }));
    }

    /**
     * Calculate prize for a ticket number
     */
    private calculatePrize(
        ticketNumber: string,
        winningNumbers: any,
    ): {
        isWinner: boolean;
        prizeTier?: string;
        prizeAmount?: number;
        message: string;
    } {
        // Prize amounts (in baht)
        const PRIZES = {
            firstPrize: 6000000,      // 6 ล้าน
            nearby: 100000,           // แสน
            threeDigitFront: 4000,    // 4 พัน
            threeDigitBack: 4000,     // 4 พัน
            twoDigit: 2000,           // 2 พัน
        };

        // Check first prize (6 digits)
        if (ticketNumber === winningNumbers.firstPrize) {
            return {
                isWinner: true,
                prizeTier: 'firstPrize',
                prizeAmount: PRIZES.firstPrize,
                message: '🎉 ยินดีด้วย! ถูกรางวัลที่ 1',
            };
        }

        // Check nearby (first prize ± 1)
        if (winningNumbers.nearby && winningNumbers.nearby.includes(ticketNumber)) {
            return {
                isWinner: true,
                prizeTier: 'nearby',
                prizeAmount: PRIZES.nearby,
                message: '🎉 ยินดีด้วย! ถูกรางวัลข้างเคียงรางวัลที่ 1',
            };
        }

        // Check 3 digits front
        const front3 = ticketNumber.substring(0, 3);
        if (winningNumbers.threeDigitFront && winningNumbers.threeDigitFront.includes(front3)) {
            return {
                isWinner: true,
                prizeTier: 'threeDigitFront',
                prizeAmount: PRIZES.threeDigitFront,
                message: '🎉 ยินดีด้วย! ถูกรางวัล 3 ตัวหน้า',
            };
        }

        // Check 3 digits back
        const back3 = ticketNumber.substring(3, 6);
        if (winningNumbers.threeDigitBack && winningNumbers.threeDigitBack.includes(back3)) {
            return {
                isWinner: true,
                prizeTier: 'threeDigitBack',
                prizeAmount: PRIZES.threeDigitBack,
                message: '🎉 ยินดีด้วย! ถูกรางวัล 3 ตัวท้าย',
            };
        }

        // Check 2 digits
        const last2 = ticketNumber.substring(4, 6);
        if (winningNumbers.twoDigit && winningNumbers.twoDigit.includes(last2)) {
            return {
                isWinner: true,
                prizeTier: 'twoDigit',
                prizeAmount: PRIZES.twoDigit,
                message: '🎉 ยินดีด้วย! ถูกรางวัล 2 ตัวท้าย',
            };
        }

        // Not a winner
        return {
            isWinner: false,
            message: 'เสียใจด้วย ไม่ถูกรางวัล',
        };
    }
}
