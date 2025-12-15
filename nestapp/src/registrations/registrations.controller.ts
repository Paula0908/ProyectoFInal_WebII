// src/registrations/registrations.controller.ts
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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { RegistrationsService } from "./registrations.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/users.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { generateFileName } from "src/utils/filename.util";
import * as fs from "fs";
import { join } from "path";
import { UpdateRegistrationStatusDto } from "./dto/update-registration-status.dto";
import { ValidateQrDto } from "./dto/validate-qr.dto";

type MeUser = { userId: number; email: string; role?: string };

function paymentFileFilter(_req: any, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new BadRequestException('El campo "paymentProof" debe ser una imagen'), false);
    }
    cb(null, true);
}

@Controller("registrations")
export class RegistrationsController {
    constructor(
        private readonly registrationsService: RegistrationsService,
        private readonly usersService: UsersService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post("events/:eventId")
    @UseInterceptors(
        FileInterceptor("paymentProof", {
            storage: diskStorage({
                destination: "uploads/comprobantes",
                filename: (_req, file, cb) => cb(null, generateFileName(file.originalname)),
            }),
            fileFilter: paymentFileFilter,
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    async registerForEvent(@Param("eventId", ParseIntPipe) eventId: number, @Req() req: { user: MeUser }, @UploadedFile() file: Express.Multer.File) {
        const currentUser = await this.usersService.findById(req.user.userId);

        if (!currentUser || currentUser.role.name !== "PARTICIPANT") {
            if (file) {
                const fullPath = join(process.cwd(), "uploads", "comprobantes", file.filename);
                fs.unlink(fullPath, () => null);
            }
            throw new ForbiddenException("Solo los PARTICIPANT pueden inscribirse a eventos.");
        }

        const paymentProofUrl = file ? `/uploads/comprobantes/${file.filename}` : null;

        try {
            const reg = await this.registrationsService.createForParticipant(eventId, currentUser, paymentProofUrl);

            return reg;
        } catch (err) {
            if (file) {
                const fullPath = join(process.cwd(), "uploads", "comprobantes", file.filename);
                fs.unlink(fullPath, () => null);
            }
            throw err;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":registrationId/payment-proof")
    @UseInterceptors(
        FileInterceptor("paymentProof", {
            storage: diskStorage({
                destination: "uploads/comprobantes",
                filename: (_req, file, cb) => cb(null, generateFileName(file.originalname)),
            }),
            fileFilter: paymentFileFilter,
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    async updatePaymentProof(@Param("registrationId", ParseIntPipe) registrationId: number, @UploadedFile() file: Express.Multer.File, @Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);

        if (!currentUser || currentUser.role.name !== "PARTICIPANT") {
            if (file) {
                const fullPath = join(process.cwd(), "uploads", "comprobantes", file.filename);
                fs.unlink(fullPath, () => null);
            }
            throw new ForbiddenException("Solo los PARTICIPANT pueden actualizar su comprobante.");
        }

        if (!file) {
            throw new BadRequestException('Falta el archivo "paymentProof" en form-data');
        }

        const paymentProofUrl = `/uploads/comprobantes/${file.filename}`;

        try {
            return await this.registrationsService.updatePaymentProof(registrationId, paymentProofUrl);
        } catch (err) {
            const fullPath = join(process.cwd(), "uploads", "comprobantes", file.filename);
            fs.unlink(fullPath, () => null);
            throw err;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get("my")
    async getMyRegistrations(@Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "PARTICIPANT") {
            throw new ForbiddenException("Solo los PARTICIPANT pueden ver sus inscripciones.");
        }

        return this.registrationsService.findForParticipant(currentUser.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get("events/:eventId")
    async getRegistrationsForEvent(@Param("eventId", ParseIntPipe) eventId: number, @Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            throw new ForbiddenException("Solo ORGANIZER pueden ver inscripciones de sus eventos.");
        }

        return this.registrationsService.findForEventAsOrganizer(eventId, currentUser);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id/status")
    async updateRegistrationStatus(@Param("id", ParseIntPipe) id: number, @Body() body: UpdateRegistrationStatusDto, @Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "ORGANIZER") {
            throw new ForbiddenException("Solo ORGANIZER pueden actualizar el estado de inscripciones.");
        }

        return this.registrationsService.updateStatusAsOrganizer(id, currentUser, body.status as "ACCEPTED" | "REJECTED");
    }
    @UseGuards(JwtAuthGuard)
    @Post("validate")
    async validateQr(@Body() body: ValidateQrDto, @Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);

        if (!currentUser || currentUser.role.name !== "VALIDATOR") {
            throw new ForbiddenException("Solo los VALIDATOR pueden validar códigos QR.");
        }

        return this.registrationsService.validateQrToken(body.qrToken);
    }
    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async cancelMyRegistration(@Param("id", ParseIntPipe) id: number, @Req() req: { user: MeUser }) {
        const currentUser = await this.usersService.findById(req.user.userId);
        if (!currentUser || currentUser.role.name !== "PARTICIPANT") {
            throw new ForbiddenException("Solo los PARTICIPANT pueden cancelar sus inscripciones.");
        }

        return this.registrationsService.cancelByParticipant(id, currentUser);
    }
}
