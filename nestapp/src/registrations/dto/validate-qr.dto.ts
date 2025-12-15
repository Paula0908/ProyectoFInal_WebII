// src/registrations/dto/validate-qr.dto.ts
import { IsNotEmpty, IsString } from "class-validator";

export class ValidateQrDto {
    @IsString()
    @IsNotEmpty()
    qrToken: string;
}
