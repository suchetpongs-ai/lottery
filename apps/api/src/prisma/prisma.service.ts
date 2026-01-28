import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pgPool?: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || '';
    const isPostgres = databaseUrl.startsWith('postgres');

    let adapter: PrismaLibSQL | PrismaPg;

    if (isPostgres) {
      // Use PostgreSQL adapter for VPS
      const pool = new Pool({ connectionString: databaseUrl });
      adapter = new PrismaPg(pool);
      console.log('🔌 Using PostgreSQL adapter');
    } else {
      // Use LibSQL adapter for local SQLite
      adapter = new PrismaLibSQL({ url: databaseUrl });
      console.log('🔌 Using LibSQL adapter');
    }

    super({
      adapter,
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
    if (this.pgPool) {
      await this.pgPool.end();
    }
  }
}
