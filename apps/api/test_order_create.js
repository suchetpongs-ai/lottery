const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing Order creation...');

        // Find a user
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found!');
            return;
        }

        console.log('Using userId:', user.id);

        // Try to create an order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                totalAmount: 80,
                status: 'Pending',
                expireAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });

        console.log('Order created successfully!');
        console.log('Order ID:', order.id.toString());

    } catch (err) {
        console.error('Error:', err.message);
        console.error('Code:', err.code);
    } finally {
        await prisma.$disconnect();
    }
}

test();
