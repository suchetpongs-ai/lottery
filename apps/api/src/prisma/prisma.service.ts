import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Prisma will automatically use DATABASE_URL from environment
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    console.log('🔌 PrismaService: Connecting to database...');
    const url = process.env.DATABASE_URL;
    console.log(`🔌 Database URL found: ${url ? 'YES' : 'NO'} (${url ? url.substring(0, 20) + '...' : 'N/A'})`);

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
