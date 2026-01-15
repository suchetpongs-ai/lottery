import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    console.log('🔌 PrismaService: Connecting to database...');
    // Log masked URL to verify it exists
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
