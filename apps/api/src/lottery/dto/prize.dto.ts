import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

// DTO สำหรับประกาศผลรางวัล
export class AnnounceResultsDto {
    @IsNumber()
    @IsNotEmpty()
    roundId: number;

    @IsNotEmpty()
    winningNumbers: {
        firstPrize: string;           // รางวัลที่ 1
        nearby: string[];             // รางวัลข้างเคียง (2 เลข)
        threeDigitFront: string[];    // 3 ตัวหน้า
        threeDigitBack: string[];     // 3 ตัวท้าย
        twoDigit: string[];           // 2 ตัว
    };
}

// DTO สำหรับตรวจรางวัล
export class CheckPrizeDto {
    @IsString()
    @IsNotEmpty()
    ticketNumber: string;

    @IsNumber()
    @IsOptional()
    roundId?: number;
}

// Response สำหรับผลการตรวจรางวัล
export interface PrizeCheckResult {
    ticketNumber: string;
    roundName: string;
    isWinner: boolean;
    prizeTier?: string;
    prizeAmount?: number;
    message: string;
}
