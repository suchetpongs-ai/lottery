import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderScheduler } from './order.scheduler';

@Module({
    controllers: [OrderController],
    providers: [OrderService, OrderScheduler],
    exports: [OrderService],
})
export class OrderModule { }
