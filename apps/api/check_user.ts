
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const user = await prisma.user.findFirst({
        where: { username: 'suchetpong' },
    });
    console.log('User found:', user);
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
