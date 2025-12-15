import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../roles/role.entity";
import { User } from "../users/entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class InitialSeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Role)
        private rolesRepo: Repository<Role>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) {}

    async onModuleInit() {
        const roleNames = ["PARTICIPANT", "ORGANIZER", "ADMIN", "VALIDATOR"];

        for (const name of roleNames) {
            const exists = await this.rolesRepo.findOne({ where: { name } });
            if (!exists) {
                await this.rolesRepo.save(this.rolesRepo.create({ name }));
            }
        }

        const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        let admin = await this.usersRepo.findOne({ where: { email: adminEmail } });

        if (!admin) {
            const adminRole = await this.rolesRepo.findOne({ where: { name: "ADMIN" } });

            const hashed = await bcrypt.hash(adminPassword, 10);

            admin = this.usersRepo.create({
                fullName: "Administrador del sistema",
                email: adminEmail,
                password: hashed,
                role: adminRole!,
            });

            await this.usersRepo.save(admin);

            console.log("Uwu Usuario admin creado:");
            console.log(`   email: ${adminEmail}`);
            console.log(`   password: ${adminPassword}`);
        } else {
            console.log(":p Usuario admin ya existe, no se va a recrear");
        }
    }
}
