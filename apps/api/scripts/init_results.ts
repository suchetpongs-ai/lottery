import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding past results...');

    // 1. Create a past round (16 Dec 2024)
    // Date: 2024 is 2567 BE.

    try {
        const existing = await prisma.round.findFirst({
            where: {
                name: { contains: '16 ธันวาคม 2567' }
            }
        });

        if (existing) {
            console.log('Round already exists, deleting...');
            await prisma.round.delete({ where: { id: existing.id } });
        }

        const round = await prisma.round.create({
            data: {
                name: 'งวดวันที่ 16 ธันวาคม 2567',
                drawDate: new Date('2024-12-16T16:00:00Z'), // UTC
                openSellingAt: new Date('2024-12-01T00:00:00Z'),
                closeSellingAt: new Date('2024-12-16T14:00:00Z'),
                status: 'Open',
            }
        });
        console.log(`Created round ${round.id}`);

        // 2. Fetch from RayRiffy API
        console.log('Fetching from API...');
        const response = await axios.get('https://lotto.api.rayriffy.com/lotto/16122567');

        if (!response.data.response) {
            throw new Error('No data from API');
        }

        const data = response.data.response;
        const allPrizes = [...data.prizes, ...data.runningNumbers];
        console.log('Available Prize IDs:', allPrizes.map((p: any) => p.id));

        const getNumbers = (id: string) => allPrizes.find((p: any) => p.id === id)?.number || [];

        const winningNumbers = {
            firstPrize: getNumbers('prizeFirst')[0] || '',
            nearby: getNumbers('prizeFirstNear'),
            threeDigitFront: getNumbers('runningNumberFrontThree').length ? getNumbers('runningNumberFrontThree') : getNumbers('runningNumberThree'), // Potential fallback
            threeDigitBack: getNumbers('runningNumberBackThree'),
            twoDigit: getNumbers('runningNumberBackTwo').length ? getNumbers('runningNumberBackTwo') : getNumbers('runningNumberTwo'),
        };

        // 3. Update Round
        await prisma.round.update({
            where: { id: round.id },
            data: {
                status: 'DRAWN',
                winningNumbers,
                resultsAnnouncedAt: new Date(),
            }
        });
        console.log('Updated round with winning numbers!');
        console.log('Sample:', winningNumbers.firstPrize);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
