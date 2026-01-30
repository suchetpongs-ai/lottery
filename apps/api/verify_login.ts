
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const phoneNumber = '0807458960'; // The user we are testing
    const password = 'password123';   // The password we expect to work

    console.log(`🔐 Verification for user: ${phoneNumber}`);
    console.log(`🔑 Testing password: '${password}'`);

    // 1. Find User
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { phoneNumber: phoneNumber },
                { username: { equals: phoneNumber } } // mimic auth.service somewhat, though auth uses unique logic
            ]
        }
    });

    if (!user) {
        console.error('❌ User NOT found in database!');
        return;
    }

    console.log(`✅ User found: ID=${user.id}, Username=${user.username}, Role=${user.role}`);
    console.log(`📝 Stored Hash: ${user.passwordHash.substring(0, 20)}...`);

    // 2. Compare Password directly
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (isValid) {
        console.log('✅ bcrypt.compare() Result: TRUE (Password MATCHES)');
    } else {
        console.error('❌ bcrypt.compare() Result: FALSE (Password DOES NOT MATCH)');

        // Debug: Try generating a new hash and seeing if it looks different
        const newHash = await bcrypt.hash(password, 10);
        console.log(`💡 If we hashed '${password}' right now, it would look like: ${newHash.substring(0, 20)}...`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
