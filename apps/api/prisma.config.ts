import { defineConfig } from 'prisma/config';

export default defineConfig({
    earlyAccess: true,
    schema: './prisma/schema.prisma',
    datasource: {
        // Use DATABASE_URL from environment
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    },
});
