import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { LotteryModule } from '../lottery/lottery.module';
import { OrderModule } from '../order/order.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserManagementService } from './user-management.service';

import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';

@Module({
    imports: [LotteryModule, PrismaModule, OrderModule],
    controllers: [AdminController, SettingsController],
    providers: [UserManagementService, SettingsService],
    exports: [UserManagementService],
})
export class AdminModule { }
