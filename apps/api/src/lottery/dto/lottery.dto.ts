import { IsString, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTicketsDto {
    @IsOptional()
    @IsString()
    number?: string; // เลขที่ต้องการค้นหา (exact, prefix, suffix)

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    roundId?: number; // ค้นหาในงวดที่ระบุ

    @IsOptional()
    @IsString()
    searchType?: 'exact' | 'prefix' | 'suffix'; // ประเภทการค้นหา

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    limit?: number = 20;
}

export class CreateRoundDto {
    @IsOptional()
    @IsString()
    name?: string; // ชื่องวด (optional - จะ generate ถ้าไม่ระบุ)

    @IsNotEmpty()
    @IsString()
    drawDate: string; // วันที่ออกรางวัล (YYYY-MM-DD)

    @IsNotEmpty()
    @IsString()
    openSellingAt: string; // วันที่เปิดขาย

    @IsOptional()
    @IsString()
    closeSellingAt?: string; // วันที่ปิดขาย (optional - default 1 day before draw)
}
