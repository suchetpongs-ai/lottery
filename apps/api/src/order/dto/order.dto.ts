import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    ticketIds: number[]; // IDs ของสลากที่ต้องการซื้อ
}

export class ConfirmPaymentDto {
    @IsNumber()
    @Type(() => Number)
    orderId: number;

    @IsNumber()
    @Type(() => Number)
    amount: number;
}
