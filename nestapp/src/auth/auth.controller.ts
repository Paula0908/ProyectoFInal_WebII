// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { UserLoginDto } from "./dtos/user-login.dto";
import { AuthService } from "./auth.service";
import { UserRegisterDto } from "./dtos/user-register.dto";
import { UserRegisterResponseDto } from "./dtos/register-response.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

type MeUser = { userId: number; email: string; role: string };

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    login(@Body() body: UserLoginDto): Promise<any> {
        return this.authService.login(body);
    }

    @Post("register")
    register(@Body() body: UserRegisterDto): Promise<UserRegisterResponseDto> {
        return this.authService.register(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    me(@Req() req: { user: MeUser }) {
        return req.user;
    }
}
