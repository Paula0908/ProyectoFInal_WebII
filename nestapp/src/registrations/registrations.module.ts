import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RegistrationsService } from "./registrations.service";
import { RegistrationsController } from "./registrations.controller";
import { Registration } from "./entities/registration.entity";
import { Event } from "../events/entities/event.entity";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [TypeOrmModule.forFeature([Registration, Event]), UsersModule],
    controllers: [RegistrationsController],
    providers: [RegistrationsService],
    exports: [RegistrationsService],
})
export class RegistrationsModule {}
