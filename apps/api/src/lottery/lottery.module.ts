import { Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { PrizeService } from './prize.service';
import { WishlistService } from './wishlist.service';
import { ClaimService } from './claim.service';
import { PrismaModule } from '../prisma/prisma.module';
// import { QueueModule } from '../queue/queue.module'; // Temporarily disabled
import { NotificationService } from '../common/notification.service';

@Module({
    imports: [PrismaModule], // QueueModule disabled temporarily
    controllers: [LotteryController],
    providers: [LotteryService, PrizeService, WishlistService, NotificationService, ClaimService],
    exports: [LotteryService, PrizeService, WishlistService, NotificationService, ClaimService],
})
export class LotteryModule { }
