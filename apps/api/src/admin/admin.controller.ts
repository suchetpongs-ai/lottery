import { Controller, Get, Post, Body, UseGuards, Param, Put, Query, Delete, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { LotteryService } from '../lottery/lottery.service';
import { PrizeService } from '../lottery/prize.service';
import { OrderService } from '../order/order.service';
import { UserManagementService } from './user-management.service';
import { CreateRoundDto, UploadTicketsDto } from '../lottery/dto/admin.dto';
import { AnnounceResultsDto } from '../lottery/dto/prize.dto';
import { BanUserDto, UserFilterDto } from './dto/user.dto';
import { ClaimService } from '../lottery/claim.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(
        private lotteryService: LotteryService,
        private prizeService: PrizeService,
        private orderService: OrderService,
        private userManagementService: UserManagementService,
        private claimService: ClaimService,
        private prisma: PrismaService,
    ) { }

    @Get('stats')
    async getStats() {
        const [tickets, orders] = await Promise.all([
            this.lotteryService.getTicketStats(),
            this.orderService.getOrderStats(),
        ]);

        return {
            totalSales: orders.totalSales,
            ticketsSold: tickets.sold,
            ticketsAvailable: tickets.available,
            activeRounds: tickets.activeRounds,
            pendingOrders: orders.pending,
        };
    }

    @Post('rounds')
    async createRound(@Body() dto: CreateRoundDto) {
        return this.lotteryService.createRound(dto);
    }

    @Get('rounds')
    async getAllRounds() {
        return this.prisma.round.findMany({
            orderBy: { drawDate: 'desc' },
        });
    }

    @Post('rounds/:id/announce-results')
    async announceResults(
        @Param('id') id: string,
        @Body() dto: AnnounceResultsDto,
    ) {
        dto.roundId = parseInt(id);
        return this.prizeService.announceResults(dto);
    }

    @Post('rounds/:id/sync-results')
    async syncResults(@Param('id') id: string) {
        return this.prizeService.fetchAndSyncResults(parseInt(id));
    }

    @Post('tickets')
    async uploadTickets(@Body() dto: UploadTicketsDto) {
        const tickets = dto.tickets.map(t => ({
            number: t.number,
            price: t.price,
            setSize: t.set,
        }));

        const result = await this.lotteryService.addTickets(
            dto.roundId,
            tickets,
        );

        return {
            success: true,
            ...result,
        };
    }

    // User Management Endpoints
    @Get('users')
    async getUsers(@Query() filter: UserFilterDto) {
        return this.userManagementService.findAll(filter);
    }

    @Put('users/:id/ban')
    async banUser(@Param('id') id: string, @Body() dto: BanUserDto) {
        return this.userManagementService.banUser(parseInt(id), dto.reason);
    }

    @Put('users/:id/unban')
    async unbanUser(@Param('id') id: string) {
        return this.userManagementService.unbanUser(parseInt(id));
    }

    // Claim Management Endpoints
    @Get('claims')
    async getClaims(@Query('status') status?: string) {
        return this.claimService.getAllClaims(status);
    }

    @Put('claims/:id/approve')
    async approveClaim(@Param('id') id: string, @Request() req) {
        return this.claimService.approveClaim(parseInt(id), req.user.userId);
    }

    @Put('claims/:id/reject')
    async rejectClaim(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
        return this.claimService.rejectClaim(parseInt(id), req.user.userId, body.reason);
    }

    @Put('claims/:id/pay')
    async markAsPaid(@Param('id') id: string, @Request() req) {
        return this.claimService.markAsPaid(parseInt(id), req.user.userId);
    }

    // Reports Endpoints
    @Get('reports/sales')
    async getSalesReports(@Query() query: any) {
        const { startDate, endDate } = query;

        // Get orders in date range
        const orders = await this.prisma.order.findMany({
            where: {
                status: 'Paid',
                ...(startDate && endDate && {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }),
            },
            include: {
                items: {
                    include: {
                        ticket: true,
                    },
                },
            },
        });

        const totalSales = orders.reduce((sum: any, order: any) => sum + Number(order.totalAmount), 0);

        return {
            totalSales,
            totalOrders: orders.length,
            orders,
        };
    }

    // Round Management (To be implemented)
    // @Get('rounds')
    // async getAllRounds() {
    //     return this.lotteryService.getAllRounds();
    // }

    // @Put('rounds/:id')
    // async updateRound(@Param('id') id: string, @Body() data: any) {
    //     return this.lotteryService.updateRound(parseInt(id), data);
    // }

    // @Delete('rounds/:id')
    // async deleteRound(@Param('id') id: string) {
    //     return this.lotteryService.deleteRound(parseInt( id));
    // }

    // Ticket Details Endpoint
    @Get('tickets/:id')
    async getTicketDetails(@Param('id') id: string) {
        return this.lotteryService.getTicketById(parseInt(id));
    }
}
