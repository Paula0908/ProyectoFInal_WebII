import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UseGuards,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/users.service";
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { generateFileName } from "src/utils/filename.util";
import * as fs from "fs";
import { join } from "path";

type MeUser = { userId: number; email: string; role?: string };

function imageFileFilter(_req: any, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new BadRequestException('El campo "image" debe ser una imagen'), false);
    }
    cb(null, true);
}

@Controller("events")
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly usersService: UsersService,
    ) {}

    @Get("all")
    getPublicEvents() {
        return this.eventsService.findPublic();
    }

    @UseGuards(JwtAuthGuard)
    @Get("mine")
    async getMyEvents(@Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            throw new ForbiddenException("Solo ORGANIZER pueden ver sus eventos.");
        }

        return this.eventsService.findByCreator(currentUser.id);
    }

    @Get(":id")
    getEventById(@Param("id", ParseIntPipe) id: number) {
        return this.eventsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createEvent(@Req() req: { user: MeUser }, @Body() createEventDto: CreateEventDto) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            throw new ForbiddenException("Solo ORGANIZER pueden crear eventos.");
        }

        const event = await this.eventsService.create(createEventDto, currentUser);
        return event;
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/image")
    @UseInterceptors(
        FileInterceptor("image", {
            storage: diskStorage({
                destination: "uploads",
                filename: (_req, file, cb) => cb(null, generateFileName(file.originalname)),
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    async uploadEventImage(@Req() req: { user: MeUser }, @Param("id", ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            if (file) {
                const fullPath = join(process.cwd(), "uploads", file.filename);
                fs.unlink(fullPath, () => null);
            }
            throw new ForbiddenException("Solo ORGANIZER pueden subir imágenes de eventos.");
        }

        if (!file) {
            throw new BadRequestException('Falta el archivo "image" en form-data');
        }

        const event = await this.eventsService.findOne(id);

        if (event.createdBy.id !== currentUser.id) {
            const fullPath = join(process.cwd(), "uploads", file.filename);
            fs.unlink(fullPath, () => null);

            throw new ForbiddenException("Solo puedes modificar eventos que creaste");
        }

        const relativePath = `/uploads/${file.filename}`;
        const updated = await this.eventsService.updateImagePath(id, relativePath);

        return {
            id: updated.id,
            imagePath: updated.imagePath,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    async updateEvent(@Req() req: { user: MeUser }, @Param("id", ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            throw new ForbiddenException("Solo ORGANIZER pueden editar eventos");
        }

        const event = await this.eventsService.findOne(id);
        if (event.createdBy.id !== currentUser.id) {
            throw new ForbiddenException("Solo puedes editar eventos que creaste");
        }

        return this.eventsService.update(id, updateEventDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeEvent(@Req() req: { user: MeUser }, @Param("id", ParseIntPipe) id: number) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            throw new ForbiddenException("Solo ORGANIZER pueden eliminar eventos");
        }

        const event = await this.eventsService.findOne(id);
        if (event.createdBy.id !== currentUser.id) {
            throw new ForbiddenException("Solo puedes eliminar eventos que creaste");
        }

        return this.eventsService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/stats")
    async getEventStats(@Param("id", ParseIntPipe) id: number, @Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            throw new ForbiddenException("Solo ORGANIZER pueden ver stats de los eventos");
        }

        return this.eventsService.getStatsForEvent(id, currentUser);
    }
}
