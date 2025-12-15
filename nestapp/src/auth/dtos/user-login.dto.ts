import { IsNotEmpty, IsString } from "class-validator";

export class UserLoginDto {
    @IsNotEmpty()
    @IsString()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
