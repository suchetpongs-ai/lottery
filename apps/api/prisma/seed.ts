import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. สร้างงวดสลาก
    console.log('Creating Round...');
    const round = await prisma.round.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'งวดวันที่ 16 ก.พ. 2569',
            drawDate: new Date('2026-02-16'),
            openSellingAt: new Date('2026-01-01'),
            closeSellingAt: new Date('2026-02-15'),
            status: 'OPEN',
        },
    });
    console.log(`✅ Created Round ID: ${round.id}`);

    // 2. สร้างสลากตัวอย่าง
    console.log('Creating Sample Tickets...');

    const popularNumbers = ['123456', '888888', '999999', '000001', '111111'];
    let ticketIdCounter = 1;

    // สร้างเลขยอดนิยม
    for (const num of popularNumbers) {
        await prisma.ticket.create({
            data: {
                // id: Auto-increment
                roundId: round.id,
                number: num,
                price: 80,
                setSize: 1,
                status: 'Available',
            },
        });
    }

    // สร้างเลขสุ่ม 20 ใบ
    for (let i = 0; i < 20; i++) {
        const randomNum = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        await prisma.ticket.create({
            data: {
                // id: Auto-increment
                roundId: round.id,
                number: randomNum,
                price: 80,
                setSize: 1,
                status: 'Available',
            },
        });
    }

    const ticketCount = popularNumbers.length + 20;
    console.log(`✅ Created ${ticketCount} tickets`);

    // 3. สร้างผู้ใช้ทดสอบ
    console.log('Creating Test Users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.upsert({
        where: { phoneNumber: '0812345678' },
        update: {},
        create: {
            username: 'testuser1',
            phoneNumber: '0812345678',
            passwordHash: hashedPassword,
            kycStatus: 'Verified',
        },
    });

    await prisma.user.upsert({
        where: { phoneNumber: '0887654321' },
        update: {},
        create: {
            username: 'testuser2',
            phoneNumber: '0887654321',
            passwordHash: hashedPassword,
            kycStatus: 'Unverified',
        },
    });

    await prisma.user.upsert({
        where: { phoneNumber: '0999999999' },
        update: {
            role: 'ADMIN' // Ensure role is updated if exists
        },
        create: {
            username: 'admin',
            phoneNumber: '0999999999',
            passwordHash: hashedPassword,
            kycStatus: 'Verified',
            role: 'ADMIN',
        },
    });

    console.log('✅ Created test users');
    console.log('\n📝 Test Credentials:');
    console.log('User 1: 0812345678 / password123');
    console.log('User 2: 0887654321 / password123');
    console.log('Admin:  0999999999 / password123');

    console.log('\n✨ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
