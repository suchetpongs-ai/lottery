
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Test Data for Announce Results ---');

    // 1. Create a Round
    const round = await prisma.round.create({
        data: {
            name: 'งวดทดสอบ 1 กุมภาพันธ์ 2568',
            drawDate: new Date('2025-02-01T00:00:00Z'),
            openSellingAt: new Date('2025-01-17T00:00:00Z'),
            closeSellingAt: new Date('2025-02-01T08:00:00Z'),
            ticketPrice: 80,
            status: 'CLOSED', // Ready to announce
            totalTickets: 1000,
            soldTickets: 2,
        },
    });
    console.log('Created Round:', round.id);

    // 2. Create Tickets
    // Ticket 1: Winner (First Prize)
    await prisma.ticket.create({
        data: {
            id: 1n, // Manual ID for BigInt
            roundId: round.id,
            number: '123456',
            price: 80,
            status: 'Sold', // Must be sold to be checked
        },
    });

    // Ticket 2: Winner (2 Digits)
    await prisma.ticket.create({
        data: {
            id: 2n,
            roundId: round.id,
            number: '999999',
            price: 80,
            status: 'Sold',
        },
    });

    // Ticket 3: Loser
    await prisma.ticket.create({
        data: {
            id: 3n,
            roundId: round.id,
            number: '000000',
            price: 80,
            status: 'Sold',
        },
    });

    console.log('Created 3 Test Tickets');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
