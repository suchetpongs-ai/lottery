import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Antigravity/Lottery/apps/api/.env' });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // For local SQLite, use absolute file path
    // Note: __dirname in compiled output is dist/prisma, so we use absolute path
    const dbPath = 'C:/Antigravity/Lottery/apps/api/prisma/dev.db';
    const connectionString = `file:${dbPath}`;

    const adapter = new PrismaLibSql({
      url: connectionString,
    } as any);

    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    console.log('🔌 PrismaService: Connecting to database...');
    const url = process.env.DATABASE_URL;
    console.log(`🔌 Database URL found: ${url ? 'YES' : 'NO'} (${url ? url.substring(0, 15) + '...' : 'N/A'})`);

    try {
      await this.$connect();
      console.log('✅ PrismaService: Connected successfully!');
    } catch (e) {
      console.error('❌ PrismaService: Connection failed!', e);
      throw e;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}


