import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class BanUserDto {
    @IsString()
    reason: string;
}

export class UserFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsBoolean()
    isBanned?: boolean;

    @IsOptional()
    @IsNumber()
    page?: number;

    @IsOptional()
    @IsNumber()
    limit?: number;
}
