import { IsString, IsNotEmpty, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^0[0-9]{9}$/, { message: 'Phone number must be 10 digits starting with 0' })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsString()
    twoFactorCode?: string;
}
