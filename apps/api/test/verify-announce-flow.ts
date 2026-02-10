
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrizeService } from '../src/lottery/prize.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { LotteryService } from '../src/lottery/lottery.service';

async function bootstrap() {
    console.log('🚀 Starting Verification Script...');

    // Create Application Context (No HTTP Server)
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'log'], // Show logs
    });

    const prisma = app.get(PrismaService);
    const prizeService = app.get(PrizeService);
    const lotteryService = app.get(LotteryService);

    try {
        // 1. Setup Data: Ensure Round 1 exists and is Open or Active
        console.log('step 1: Preparing Data...');
        const roundId = 1;
        let round = await prisma.round.findUnique({ where: { id: roundId } });

        if (!round) {
            console.log('Creating Round 1...');
            round = await prisma.round.create({
                data: {
                    id: 1,
                    name: 'Verification Round',
                    drawDate: new Date(),
                    openSellingAt: new Date(),
                    closeSellingAt: new Date(),
                    status: 'OPEN',
                }
            });
        }

        // 2. Ensure we have a specific winning ticket purchased
        const winningNumber = '999123';
        console.log(`Step 2: Ensuring ticket ${winningNumber} exists...`);

        let ticket = await prisma.ticket.findFirst({
            where: { roundId, number: winningNumber }
        });


        if (!ticket) {
            // Generates a random BigInt-compatible ID (safe integer limit for JS is 2^53, BigInt can go higher but let's stick to safe range)
            const randomId = Math.floor(Math.random() * 1000000000);
            ticket = await prisma.ticket.create({
                data: {
                    id: randomId, // Manually assign ID to avoid autoincrement issues
                    roundId,
                    number: winningNumber,
                    price: 80,
                    setSize: 1,
                    status: 'Sold', // Must be sold to be checked
                }
            });
            console.log('Created winning ticket with ID:', randomId);
        } else {
            // Update to Sold if not
            if (ticket.status !== 'Sold') {
                await prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { status: 'Sold' },
                });
                console.log('Updated ticket to SOLD status.');
            }
        }

        // Ensure a user owns it (for notification logic, though we might skip notification verification here)
        // We need an order for it? Implementation says:
        // "Find the owner and notify them... paidOrder = ticket.orderItems..."
        // If no owner, it just updates the ticket. We verify ticket update.

        // 3. Announce Results
        console.log('Step 3: Announcing Results...');
        const winningNumbers = {
            firstPrize: winningNumber, // 6 Million!
            nearby: [],
            threeDigitFront: [],
            threeDigitBack: [],
            twoDigit: [],
        };

        await prizeService.announceResults({
            roundId,
            winningNumbers,
        });

        // 4. Verify Database Update
        console.log('Step 4: Verifying Ticket Status...');
        const updatedTicket = await prisma.ticket.findUnique({
            where: { id: ticket.id },
        });


        const prizeAmount = Number(updatedTicket.prizeAmount);
        if (prizeAmount === 6000000) {
            console.log('✅ SUCCESS: Ticket marked as winner with 6,000,000 Prize!');
        } else {
            console.error('❌ FAILED: Ticket prize amount is ' + prizeAmount);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
