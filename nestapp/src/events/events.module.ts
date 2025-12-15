import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { UsersModule } from "../users/users.module";
import { Registration } from "src/registrations/entities/registration.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Event, Registration]), UsersModule],
    controllers: [EventsController],
    providers: [EventsService],
    exports: [EventsService],
})
export class EventsModule {}
