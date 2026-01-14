import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CheckoutDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @UseGuards(JwtAuthGuard)
    @Post('checkout')
    async checkout(@Request() req, @Body() checkoutDto: CheckoutDto) {
        return this.orderService.checkout(req.user.id, checkoutDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/pay')
    async confirmPayment(@Param('id') id: string) {
        return this.orderService.confirmPayment(parseInt(id));
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getOrder(@Request() req, @Param('id') id: string) {
        return this.orderService.getOrder(parseInt(id), req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserOrders(@Request() req) {
        return this.orderService.getUserOrders(req.user.id);
    }
}
