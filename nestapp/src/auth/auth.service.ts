// src/auth/auth.service.ts
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { UserLoginDto } from "./dtos/user-login.dto";
import { UserRegisterDto } from "./dtos/user-register.dto";
import { UserRegisterResponseDto } from "./dtos/register-response.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../roles/role.entity";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
        @InjectRepository(Role)
        private rolesRepo: Repository<Role>,
    ) {}

    async login(body: UserLoginDto): Promise<any> {
        const user = await this.usersService.findByEmail(body.email);
        if (!user) throw new UnauthorizedException();

        const ok = await bcrypt.compare(body.password, user.password);
        if (!ok) throw new UnauthorizedException();

        const payload = { sub: user.id, email: user.email, role: user.role.name };
        const access_token = await this.jwt.signAsync(payload);

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role.name,
            },
        };
    }

    async register(body: UserRegisterDto): Promise<UserRegisterResponseDto> {
        const exists = await this.usersService.findByEmail(body.email);
        if (exists) throw new ConflictException("User already exists");

        const participantRole = await this.rolesRepo.findOne({
            where: { name: "PARTICIPANT" },
        });
        if (!participantRole) {
            throw new InternalServerErrorException("Rol PARTICIPANT no encontrado :p Contacte al administrador del sistema");
        }

        const hashed = await bcrypt.hash(body.password, 10);
        const newUser = await this.usersService.createUser({
            email: body.email,
            password: hashed,
            fullName: body.fullName,
            role: participantRole,
        });

        return {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
        };
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new BadRequestException("Usuario no encontrado.");
        }

        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
            throw new BadRequestException("Contraseña actual incorrecta.");
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await this.usersService.updateUser(userId, {
            password: hashed,
        });

        return { message: "Contraseña actualizada correctamente." };
    }
}
