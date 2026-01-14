import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderScheduler } from './order.scheduler';
import { NotificationService } from '../common/notification.service';

@Module({
    controllers: [OrderController],
    providers: [OrderService, OrderScheduler, NotificationService],
    exports: [OrderService],
})
export class OrderModule { }
