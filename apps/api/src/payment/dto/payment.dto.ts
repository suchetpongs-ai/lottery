import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateChargeDto {
    @IsNumber()
    orderId: number;

    @IsNumber()
    amount: number;

    @IsString()
    token: string; // Omise token from client

    @IsOptional()
    @IsString()
    description?: string;
}

export class GenerateQRDto {
    @IsNumber()
    orderId: number;

    @IsNumber()
    amount: number;
}

export class WebhookDto {
    // Flexible to accept any webhook payload
    [key: string]: any;
}
