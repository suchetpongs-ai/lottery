import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
    constructor(private auditService: AuditService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getLogs(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('userId') userId?: number,
        @Query('action') action?: string,
    ) {
        return this.auditService.getLogs(Number(page), Number(limit), userId ? Number(userId) : undefined, action);
    }
}
