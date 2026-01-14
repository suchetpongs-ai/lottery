import { IsArray, IsString, IsNumber, IsOptional } from 'class-validator';

export class SaveWishlistDto {
    @IsArray()
    @IsString({ each: true })
    numbers: string[];
}

export class CheckWishlistDto {
    @IsNumber()
    roundId: number;
}
