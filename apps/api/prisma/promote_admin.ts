import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('👑 Creating ADMIN user...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { phoneNumber: '0999999999' },
        update: { role: 'ADMIN' },
        create: {
            username: 'admin',
            phoneNumber: '0999999999',
            passwordHash: hashedPassword,
            role: 'ADMIN',
            kycStatus: 'Verified'
        },
    });

    console.log(`✅ Successfully created/updated Admin User:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Phone: ${user.phoneNumber}`);
    console.log(`   Role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
