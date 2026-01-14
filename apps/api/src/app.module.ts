import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LotteryModule } from './lottery/lottery.module';
import { OrderModule } from './order/order.module';
import { AdminModule } from './admin/admin.module';
import { LoggerModule } from './common/logger/logger.module';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
// import { QueueModule } from './queue/queue.module'; // Temporarily disabled
import { PaymentModule } from './payment/payment.module';
import { KYCModule } from './kyc/kyc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per 60s (global default)
      },
    ]),
    PrismaModule,
    LoggerModule,
    AuthModule,
    LotteryModule,
    OrderModule,
    AdminModule,
    // QueueModule, // Temporarily disabled
    PaymentModule,
    KYCModule,
  ],
  controllers: [AppController],
  providers: [AppService, HttpLoggingInterceptor, AllExceptionsFilter],
})
export class AppModule { }
