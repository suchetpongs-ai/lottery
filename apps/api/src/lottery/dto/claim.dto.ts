import { IsNumber, IsOptional } from 'class-validator';

export class CreateClaimDto {
    @IsNumber()
    ticketId: number;
}

export class ProcessClaimDto {
    @IsOptional()
    rejectionReason?: string;
}
