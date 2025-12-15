// src/users/dto/admin-update-user.dto.ts
import { IsOptional, IsString } from "class-validator";

export class AdminUpdateUserDto {
    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    roleName?: string;

    @IsOptional()
    @IsString()
    password?: string;
}
