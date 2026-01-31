import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OmiseService } from './omise.service';
import { TmweasyService } from './tmweasy.service';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [PaymentController],
    providers: [PaymentService, OmiseService, TmweasyService],
    exports: [PaymentService, OmiseService, TmweasyService],
})
export class PaymentModule { }
