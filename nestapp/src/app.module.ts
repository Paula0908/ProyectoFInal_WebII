import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { SeedModule } from "./seed/seed.module";
import { EventsModule } from "./events/events.module";
import { RegistrationsModule } from "./registrations/registrations.module";

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), "uploads"),
            serveRoot: "/uploads",
        }),
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: "sqlite",
            /* eto se agrega para otras db
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT ?? "", 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            */
            database: process.env.DB_NAME,
            autoLoadEntities: true, // entities: [] que llenamos manualmente,
            synchronize: true, //solo mientras estén en desarrollo
        }),
        AuthModule,
        UsersModule,
        EventsModule,
        RegistrationsModule,
        SeedModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
