import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../roles/role.entity";
import { User } from "../users/entities/user.entity";
import { InitialSeedService } from "./initial-seed.service";

@Module({
    imports: [TypeOrmModule.forFeature([Role, User])],
    providers: [InitialSeedService],
})
export class SeedModule {}
