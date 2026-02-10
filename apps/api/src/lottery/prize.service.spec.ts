
import { Test, TestingModule } from '@nestjs/testing';
import { PrizeService } from './prize.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/notification.service';
import { Logger } from '@nestjs/common';

// Mock dependencies
const mockPrismaService = {
    round: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    ticket: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
};

const mockNotificationService = {
    notifyPrizeWin: jest.fn().mockResolvedValue(true),
};

describe('PrizeService', () => {
    let service: PrizeService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrizeService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: NotificationService, useValue: mockNotificationService },
                Logger,
            ],
        }).compile();

        service = module.get<PrizeService>(PrizeService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('calculatePrize', () => {
        // Accessing private method for testing logic directly
        // Ideally should test public methods, but logic is encapsualted in private helper.
        // We can test via checkPrize or make helper public/protected for testing.
        // For now, we'll cast to any to access private method.

        const winningNumbers = {
            firstPrize: '123456',
            nearby: ['123455', '123457'],
            threeDigitFront: ['111', '222'],
            threeDigitBack: ['888', '999'],
            twoDigit: ['00'],
        };

        it('should identify First Prize winner', () => {
            const result = (service as any).calculatePrize('123456', winningNumbers);
            expect(result.isWinner).toBe(true);
            expect(result.prizeTier).toContain('firstPrize');
            expect(result.prizeAmount).toBeGreaterThanOrEqual(6000000);
        });

        it('should identify Nearby Prize winner', () => {
            const result = (service as any).calculatePrize('123455', winningNumbers);
            expect(result.isWinner).toBe(true);
            expect(result.prizeTier).toContain('nearby');
            expect(result.prizeAmount).toBe(100000);
        });

        it('should identify 2-Digit Prize winner', () => {
            const result = (service as any).calculatePrize('555500', winningNumbers);
            expect(result.isWinner).toBe(true);
            expect(result.prizeTier).toContain('twoDigit');
            expect(result.prizeAmount).toBe(2000);
        });


        it('should identify Multiple Prizes (e.g. 2-Digit + 3-Digit Back)', () => {
            // Setup: Ticket ends with 888 (matches 3-back) AND last 2 digits match 2-digit prize
            // Main winningNumbers threeDigitFront: ['111', '222']
            // We use 444 as front to avoid matching front prize
            const customWinning = {
                ...winningNumbers,
                twoDigit: ['88'], // Last 2 of 888 is 88
            };

            const result = (service as any).calculatePrize('444888', customWinning);
            expect(result.isWinner).toBe(true);
            expect(result.prizeTier).toContain('threeDigitBack'); // 4000
            expect(result.prizeTier).toContain('twoDigit'); // 2000
            expect(result.prizeAmount).toBe(4000 + 2000);
        });

        it('should handle duplicate validation for multi-set prizes (e.g. 3-digit front)', () => {
            // If ticket matches multiple sets in 3-digit front
            const customWinning = {
                ...winningNumbers,
                threeDigitFront: ['111', '111'], // Duplicate set
            };

            // Use 111234. 
            // Front 111 (matches twice). 
            // Back 234 (no match). 
            // Last 2 34 (no match).
            const result = (service as any).calculatePrize('111234', customWinning);
            expect(result.isWinner).toBe(true);
            // Should win twice
            expect(result.prizeAmount).toBe(4000 * 2);
        });

        it('should return non-winner for losing ticket', () => {
            // 00 is a winner in 2-digit, so 000000 is a winner.
            // Use 101010
            const result = (service as any).calculatePrize('101010', winningNumbers);
            expect(result.isWinner).toBe(false);
            expect(result.prizeAmount).toBeUndefined();
        });
    });
});
