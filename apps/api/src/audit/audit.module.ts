import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global() // Global so it can be easily logged from anywhere
@Module({
    providers: [AuditService],
    controllers: [AuditController],
    exports: [AuditService],
})
export class AuditModule { }
