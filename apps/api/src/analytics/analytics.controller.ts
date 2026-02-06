import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getDashboardStats() {
        return this.analyticsService.getDashboardStats();
    }

    @Post('trigger-daily')
    @Roles(UserRole.SUPER_ADMIN)
    async triggerDailyStats() {
        await this.analyticsService.handleDailyStats();
        return { message: 'Daily stats aggregation triggered' };
    }
}
