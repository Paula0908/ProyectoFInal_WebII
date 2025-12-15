import { IsNotEmpty, IsString } from "class-validator";

export class UserRegisterDto {
    @IsNotEmpty()
    @IsString()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    readonly fullName: string;
}
