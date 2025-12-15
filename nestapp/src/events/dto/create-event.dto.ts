import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    dateTime: string;

    @IsString()
    @IsNotEmpty()
    locationText: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsNumber()
    @Min(1)
    capacityMax: number;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsString()
    imagePath?: string;
}
