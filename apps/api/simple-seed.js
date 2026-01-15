const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting simple seed...');

    // Create Round
    const round = await prisma.round.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'งวดวันที่ 16 ก.พ. 2569',
            drawDate: new Date('2026-02-16'),
            openSellingAt: new Date('2026-01-01'),
            closeSellingAt: new Date('2026-02-15'),
            status: 'Open',
        },
    });
    console.log('✅ Round created:', round.id);

    // Create Tickets
    let idCounter = 1n;
    const numbers = ['123456', '888888', '999999'];

    for (const num of numbers) {
        await prisma.ticket.create({
            data: {
                id: idCounter++,
                roundId: round.id,
                number: num,
                price: 80,
                status: 'Available'
            }
        }).catch(e => console.log('Ticket exists or error:', e.message));
    }
    console.log('✅ Tickets created');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
