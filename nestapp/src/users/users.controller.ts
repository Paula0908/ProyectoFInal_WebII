import { Body, ConflictException, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { UsersService } from "./users.service";
import { AdminCreateUserDto } from "./dto/admin-create-user.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Role } from "../roles/role.entity";

type MeUser = { userId: number; email: string };

@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @InjectRepository(Role)
        private readonly rolesRepo: Repository<Role>,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createUserByAdmin(@Req() req: { user: MeUser }, @Body() body: AdminCreateUserDto) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ADMIN") {
            throw new ForbiddenException("Solo un ADMIN puede crear usuarios");
        }

        const exists = await this.usersService.findByEmail(body.email);
        if (exists) {
            throw new ConflictException("Ya existe un usuario con ese correo");
        }

        const role = await this.rolesRepo.findOne({
            where: { name: body.roleName },
        });
        if (!role) {
            throw new ConflictException(`Rol '${body.roleName}' no es válido (usa PARTICIPANT, ORGANIZER, ADMIN o VALIDATOR).`);
        }

        const hashed = await bcrypt.hash(body.password, 10);

        const newUser = await this.usersService.createUserByAdmin({
            email: body.email,
            fullName: body.fullName,
            password: hashed,
            role,
        });

        return {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role.name,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ADMIN") {
            throw new ForbiddenException("Solo un ADMIN puede ver la lista de usuarios");
        }

        const users = await this.usersService.findAll();
        return users.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.fullName,
            role: u.role.name,
        }));
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updateUserByAdmin(@Req() req: { user: MeUser }, @Param("id", ParseIntPipe) id: number, @Body() body: AdminUpdateUserDto) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ADMIN") {
            throw new ForbiddenException("Solo un ADMIN puede actualizar usuarios");
        }

        const user = await this.usersService.findById(id);
        if (!user) {
            throw new ConflictException("Usuario no encontrado");
        }

        if (body.email && body.email !== user.email) {
            const exists = await this.usersService.findByEmail(body.email);
            if (exists) {
                throw new ConflictException("Ya existe otro usuario con ese correo");
            }
        }

        let newRole: Role | undefined = undefined;
        if (body.roleName) {
            const role = await this.rolesRepo.findOne({
                where: { name: body.roleName },
            });
            if (!role) {
                throw new ConflictException(`Rol '${body.roleName}' no es válido (usa PARTICIPANT, ORGANIZER, ADMIN o VALIDATOR)`);
            }
            newRole = role;
        }

        let newPasswordHashed: string | undefined = undefined;
        if (body.password) {
            newPasswordHashed = await bcrypt.hash(body.password, 10);
        }

        const updated = await this.usersService.updateUser(id, {
            email: body.email ?? user.email,
            fullName: body.fullName ?? user.fullName,
            role: newRole ?? user.role,
            password: newPasswordHashed ?? user.password,
        });

        return {
            id: updated?.id,
            email: updated?.email,
            fullName: updated?.fullName,
            role: updated?.role.name,
        };
    }
    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async deleteUserByAdmin(@Req() req: { user: MeUser }, @Param("id", ParseIntPipe) id: number) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ADMIN") {
            throw new ForbiddenException("Solo un ADMIN puede eliminar usuarios");
        }

        if (currentUser.id === id) {
            throw new ForbiddenException("No puedes eliminar tu propio usuario");
        }

        const user = await this.usersService.findById(id);
        if (!user) {
            throw new ConflictException("Usuario no encontrado");
        }

        await this.usersService.deleteUser(id);

        return { message: "Usuario eliminado correctamente" };
    }
}
