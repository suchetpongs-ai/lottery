const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const round = await prisma.lotteryRound.findFirst({
            where: { status: 'OPEN' },
            include: {
                tickets: {
                    take: 1
                }
            }
        });

        if (round) {
            console.log('Found Open Round:', round.id);
            if (round.tickets.length > 0) {
                console.log('Found Ticket ID:', round.tickets[0].id);
                console.log('Ticket Number:', round.tickets[0].number);
            } else {
                console.log('No tickets in this round yet.');
            }
        } else {
            console.log('No OPEN rounds found.');
            // Try finding any round
            const anyRound = await prisma.lotteryRound.findFirst();
            if (anyRound) console.log('Found (closed/other) Round:', anyRound.id);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
