import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { PrizeService } from './prize.service';
import { WishlistService } from './wishlist.service';
import { ClaimService } from './claim.service';
import { SearchTicketsDto, CreateRoundDto } from './dto/lottery.dto';
import { CheckPrizeDto } from './dto/prize.dto';
import { SaveWishlistDto } from './dto/wishlist.dto';
import { CreateClaimDto } from './dto/claim.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from '../common/notification.service';

@Controller('lottery')
export class LotteryController {
    constructor(
        private readonly lotteryService: LotteryService,
        private readonly prizeService: PrizeService,
        private readonly wishlistService: WishlistService,
        private readonly claimService: ClaimService,
        private readonly notificationService: NotificationService,
    ) { }

    @Get('search')
    async searchTickets(@Query() searchDto: SearchTicketsDto) {
        return this.lotteryService.searchTickets(searchDto);
    }

    @Get('ticket/:id')
    async getTicket(@Param('id') id: string) {
        return this.lotteryService.getTicketById(parseInt(id));
    }

    @Get('round/current')
    async getCurrentRound() {
        return this.lotteryService.getCurrentRound();
    }

    @Get('results')
    async getPastResults() {
        return this.lotteryService.getPastRounds();
    }

    // Prize checking endpoint (public)
    @Post('check-prize')
    async checkPrize(@Body() dto: CheckPrizeDto) {
        return this.prizeService.checkPrize(dto);
    }

    // Get user's winning tickets (protected)
    @UseGuards(JwtAuthGuard)
    @Get('my-prizes')
    async getMyPrizes(@Request() req) {
        return this.prizeService.getUserPrizes(req.user.userId);
    }

    // Claim endpoints
    @UseGuards(JwtAuthGuard)
    @Post('claim-prize')
    async createClaim(@Request() req, @Body() dto: CreateClaimDto) {
        return this.claimService.createClaim(req.user.userId, dto.ticketId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-claims')
    async getMyClaims(@Request() req) {
        return this.claimService.getUserClaims(req.user.userId);
    }

    // Wishlist endpoints
    @UseGuards(JwtAuthGuard)
    @Post('wishlist')
    async saveWishlist(@Request() req, @Body() dto: SaveWishlistDto) {
        return this.wishlistService.saveWishlist(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('wishlist')
    async getWishlist(@Request() req) {
        return this.wishlistService.getWishlist(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('wishlist')
    async deleteWishlist(@Request() req) {
        return this.wishlistService.deleteWishlist(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('check-wishlist/:roundId')
    async checkWishlist(@Request() req, @Param('roundId') roundId: string) {
        return this.wishlistService.checkWishlistAgainstRound(
            req.user.userId,
            parseInt(roundId),
        );
    }

    // Notification endpoints
    @UseGuards(JwtAuthGuard)
    @Get('notifications')
    async getNotifications(@Request() req, @Query('limit') limit?: string) {
        return this.notificationService.getUserNotifications(
            req.user.userId,
            limit ? parseInt(limit) : 20,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('notifications/unread-count')
    async getUnreadCount(@Request() req) {
        return this.notificationService.getUnreadCount(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('notifications/:id/read')
    async markAsRead(@Request() req, @Param('id') id: string) {
        return this.notificationService.markAsRead(parseInt(id), req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('notifications/read-all')
    async markAllAsRead(@Request() req) {
        return this.notificationService.markAllAsRead(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('round')
    async createRound(@Body() createRoundDto: CreateRoundDto) {
        return this.lotteryService.createRound(createRoundDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('round/:id/close')
    async closeRound(@Param('id') id: string) {
        return this.lotteryService.closeRound(parseInt(id));
    }

    @UseGuards(JwtAuthGuard)
    @Post('tickets')
    async addTickets(
        @Body() body: { roundId: number; tickets: any[] }
    ) {
        return this.lotteryService.addTickets(body.roundId, body.tickets);
    }
}
