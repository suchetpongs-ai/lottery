import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveWishlistDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
    constructor(private prisma: PrismaService) { }

    async saveWishlist(userId: number, dto: SaveWishlistDto) {
        // Store as JSON string
        const numbersJson = JSON.stringify(dto.numbers);

        return this.prisma.wishlist.upsert({
            where: { userId },
            create: {
                userId,
                numbers: numbersJson,
            },
            update: {
                numbers: numbersJson,
            },
        });
    }

    async getWishlist(userId: number) {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
        });

        if (!wishlist) {
            return { numbers: [] };
        }

        return {
            numbers: JSON.parse(wishlist.numbers),
            updatedAt: wishlist.updatedAt,
        };
    }

    async deleteWishlist(userId: number) {
        return this.prisma.wishlist.delete({
            where: { userId },
        });
    }

    async checkWishlistAgainstRound(userId: number, roundId: number) {
        const wishlist = await this.getWishlist(userId);

        if (wishlist.numbers.length === 0) {
            return { matches: [], message: 'ไม่มีเลขโปรดที่บันทึกไว้' };
        }

        const round = await this.prisma.round.findUnique({
            where: { id: roundId },
        });

        if (!round || !round.winningNumbers) {
            return { matches: [], message: 'งวดนี้ยังไม่ประกาศผล' };
        }

        const winningNumbers = round.winningNumbers as any;
        const matches: Array<{ number: string; tier: string; prize: number }> = [];

        // Check each wishlist number against winning numbers
        for (const number of wishlist.numbers) {
            // First prize
            if (number === winningNumbers.firstPrize) {
                matches.push({ number, tier: 'รางวัลที่ 1', prize: 6000000 });
                continue;
            }

            // Nearby
            if (winningNumbers.nearby && winningNumbers.nearby.includes(number)) {
                matches.push({ number, tier: 'รางวัลข้างเคียง', prize: 100000 });
                continue;
            }

            // 3 digits front
            const front3 = number.substring(0, 3);
            if (winningNumbers.threeDigitFront && winningNumbers.threeDigitFront.includes(front3)) {
                matches.push({ number, tier: 'เลขหน้า 3 ตัว', prize: 4000 });
                continue;
            }

            // 3 digits back
            const back3 = number.substring(3, 6);
            if (winningNumbers.threeDigitBack && winningNumbers.threeDigitBack.includes(back3)) {
                matches.push({ number, tier: 'เลขท้าย 3 ตัว', prize: 4000 });
                continue;
            }

            // 2 digits
            const last2 = number.substring(4, 6);
            if (winningNumbers.twoDigit && winningNumbers.twoDigit.includes(last2)) {
                matches.push({ number, tier: 'เลขท้าย 2 ตัว', prize: 2000 });
            }
        }

        return {
            matches,
            totalMatches: matches.length,
            totalPotentialPrize: matches.reduce((sum, m) => sum + m.prize, 0),
            message: matches.length > 0
                ? `พบเลขโปรดที่ถูกรางวัล ${matches.length} เลข!`
                : 'เลขโปรดไม่ถูกรางวัล',
        };
    }
}
