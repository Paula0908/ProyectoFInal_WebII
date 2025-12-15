// src/auth/jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";

type JwtPayload = { sub: number; email: string; role: string; iat?: number; exp?: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const options: StrategyOptions = {
            secretOrKey: process.env.JWT_SECRET ?? "dev-secret",
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
        };
        super(options);
    }

    validate(payload: JwtPayload) {
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}
