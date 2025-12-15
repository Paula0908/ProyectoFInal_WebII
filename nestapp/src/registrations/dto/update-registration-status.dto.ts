import { IsIn, IsString } from "class-validator";

export class UpdateRegistrationStatusDto {
    @IsString()
    @IsIn(["ACCEPTED", "REJECTED"])
    status: string;
}
