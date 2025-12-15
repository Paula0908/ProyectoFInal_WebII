// src/users/users.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Role } from "../roles/role.entity";

export interface CreateUserInput {
    email: string;
    password: string;
    fullName: string;
    role: Role;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {}

    findByEmail(email: string) {
        return this.usersRepo.findOne({
            where: { email },
            relations: ["role"],
        });
    }

    findById(id: number) {
        return this.usersRepo.findOne({
            where: { id },
            relations: ["role"],
        });
    }

    createUser(data: CreateUserInput) {
        const user = this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }

    createUserByAdmin(data: CreateUserInput) {
        const user = this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }

    findAll() {
        return this.usersRepo.find({
            relations: ["role"],
        });
    }

    async updateUser(id: number, data: Partial<Pick<User, "email" | "fullName" | "password"> & { role?: Role }>) {
        const user = await this.findById(id);
        if (!user) return null;

        if (data.email !== undefined) user.email = data.email;
        if (data.fullName !== undefined) user.fullName = data.fullName;
        if (data.password !== undefined) user.password = data.password;
        if (data.role !== undefined) user.role = data.role;

        return this.usersRepo.save(user);
    }

    async deleteUser(id: number) {
        await this.usersRepo.delete(id);
    }
}
