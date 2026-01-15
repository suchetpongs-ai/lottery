import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "ts-node prisma/seed.ts",
    },
    datasource: {
        // Read from environment variable
        url: process.env.DATABASE_URL,
    },
});
