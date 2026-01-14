import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateRoundDto {
    @IsDateString()
    @IsNotEmpty()
    drawDate: string;

    @IsDateString()
    @IsNotEmpty()
    openSellingAt: string;
}

export class UploadTicketsDto {
    @IsNotEmpty()
    roundId: number;

    @IsNotEmpty()
    tickets: {
        number: string;
        price: number;
        set: number;
    }[];
}
