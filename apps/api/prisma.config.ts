import { defineConfig } from 'prisma/config';

export default defineConfig({
    earlyAccess: true,
    schema: './prisma/schema.prisma',
    datasource: {
        url: 'file:./prisma/dev.db',
    },
});
