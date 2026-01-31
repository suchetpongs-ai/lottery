
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser(identifier) {
    console.log(`Checking for user: ${identifier}`);
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: identifier },
                { phoneNumber: identifier },
            ],
        },
    });

    if (user) {
        console.log(`✅ User found: ${user.username} (ID: ${user.id}, Phone: ${user.phoneNumber})`);
        return true;
    } else {
        console.log(`❌ User NOT found: ${identifier}`);
        return false;
    }
}

async function run() {
    await checkUser('suchetpong');
    await checkUser('test_user_49298'); // The one we supposedly registered
}

run()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
