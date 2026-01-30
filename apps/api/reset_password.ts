import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const phoneNumber = '0807458960'; // The user's phone number
    const newPassword = 'password123'; // Default new password

    console.log(`🔄 Resetting password for ${phoneNumber}...`);

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { phoneNumber: phoneNumber },
                { username: 'suchetpong' }
            ]
        }
    });

    if (!user) {
        console.error('❌ User not found!');
        return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
            role: 'ADMIN' // Force admin role just in case
        }
    });

    console.log(`✅ Password reset successfully!`);
    console.log(`User: ${user.username} (${user.phoneNumber})`);
    console.log(`New Password: ${newPassword}`);
    console.log(`Role: ADMIN`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
