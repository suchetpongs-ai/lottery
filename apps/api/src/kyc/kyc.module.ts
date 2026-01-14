import { Module } from '@nestjs/common';
import { KYCController } from './kyc.controller';
import { KYCService } from './kyc.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SMSService } from '../common/sms.service';

@Module({
    imports: [PrismaModule],
    controllers: [KYCController],
    providers: [KYCService, SMSService],
    exports: [KYCService],
})
export class KYCModule { }
