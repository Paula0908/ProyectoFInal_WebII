// src/registrations/registrations.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Registration } from "./entities/registration.entity";
import { Event } from "../events/entities/event.entity";
import { User } from "../users/entities/user.entity";

@Injectable()
export class RegistrationsService {
    constructor(
        @InjectRepository(Registration)
        private readonly registrationsRepo: Repository<Registration>,
        @InjectRepository(Event)
        private readonly eventsRepo: Repository<Event>,
    ) {}

    async createForParticipant(eventId: number, participant: User, paymentProofUrl: string | null) {
        const event = await this.eventsRepo.findOne({ where: { id: eventId } });

        if (!event) {
            throw new NotFoundException("Evento no encontrado.");
        }

        const now = new Date();
        if (event.dateTime < now) {
            throw new BadRequestException("No puedes inscribirte a un evento ya realizado.");
        }

        if (event.price > 0 && !paymentProofUrl) {
            throw new BadRequestException("Este evento requiere que adjuntes un comprobante de pago.");
        }

        const existing = await this.registrationsRepo.findOne({
            where: {
                event: { id: eventId },
                participant: { id: participant.id },
                status: In(["PENDING", "ACCEPTED"]),
            },
        });

        if (existing) {
            throw new ConflictException("Ya tienes una inscripción activa para este evento.");
        }

        const activeCount = await this.registrationsRepo.count({
            where: {
                event: { id: eventId },
                status: In(["PENDING", "ACCEPTED"]),
            },
        });

        if (activeCount >= event.capacityMax) {
            throw new BadRequestException("El evento ya alcanzó el número máximo de inscripciones.");
        }

        const reg = this.registrationsRepo.create({
            event,
            participant,
            status: "PENDING",
            paymentProofUrl,
            qrToken: null,
            checkInAt: null,
        });

        return this.registrationsRepo.save(reg);
    }
    async updatePaymentProof(registrationId: number, newPaymentProofUrl: string | null) {
        const registration = await this.registrationsRepo.findOne({
            where: { id: registrationId },
        });

        if (!registration) {
            throw new NotFoundException("Inscripción no encontrada.");
        }

        if (registration.status !== "REJECTED") {
            throw new BadRequestException("Solo se puede enviar un nuevo comprobante si la inscripción fue rechazada.");
        }

        registration.paymentProofUrl = newPaymentProofUrl;
        registration.status = "PENDING";

        return this.registrationsRepo.save(registration);
    }

    async updateStatusAsOrganizer(registrationId: number, organizer: User, newStatus: "ACCEPTED" | "REJECTED") {
        const reg = await this.registrationsRepo.findOne({
            where: { id: registrationId },
            relations: ["event", "event.createdBy", "participant"],
        });

        if (!reg) {
            throw new NotFoundException("Inscripción no encontrada.");
        }

        if (reg.event.createdBy.id !== organizer.id) {
            throw new ForbiddenException("Solo puedes gestionar inscripciones de tus eventos.");
        }

        if (reg.status === "CANCELLED") {
            throw new BadRequestException("No puedes cambiar el estado de una inscripción cancelada.");
        }

        const now = new Date();
        if (reg.event.dateTime < now) {
            throw new BadRequestException("No puedes cambiar el estado de inscripciones de un evento ya realizado.");
        }

        if (newStatus === "ACCEPTED") {
            reg.status = "ACCEPTED";
            if (!reg.qrToken) {
                reg.qrToken = crypto.randomUUID();
            }
        } else {
            reg.status = "REJECTED";
            reg.qrToken = null;
        }

        return this.registrationsRepo.save(reg);
    }
    async findForEventAsOrganizer(eventId: number, organizer: User) {
        const event = await this.eventsRepo.findOne({
            where: { id: eventId },
            relations: ["createdBy"],
        });

        if (!event) throw new NotFoundException("Evento no encontrado.");
        if (event.createdBy.id !== organizer.id) {
            throw new ForbiddenException("Solo puedes ver inscripciones de tus eventos.");
        }

        return this.registrationsRepo.find({
            where: { event: { id: eventId } },
            relations: ["participant"],
            order: { id: "ASC" },
        });
    }

    async findForParticipant(participantId: number) {
        return this.registrationsRepo.find({
            where: { participant: { id: participantId } },
            relations: ["event"],
            order: { id: "ASC" },
        });
    }
    async validateQrToken(qrToken: string) {
        const reg = await this.registrationsRepo.findOne({
            where: { qrToken },
            relations: ["event", "participant"],
        });

        if (!reg) {
            throw new NotFoundException("QR no válido o inscripción no encontrada");
        }

        if (reg.status !== "ACCEPTED") {
            throw new BadRequestException("La inscripción todavia no está aceptada o fue rechazada");
        }

        const now = new Date();

        if (reg.event.dateTime < now) {
            throw new BadRequestException("No puedes hacer check-in a un evento que ya ha finalizado :p");
        }

        if (reg.checkInAt) {
            throw new BadRequestException(`Este QR ya fue utilizado el ${reg.checkInAt.toISOString()}`);
        }

        reg.checkInAt = now;
        await this.registrationsRepo.save(reg);

        return {
            registrationId: reg.id,
            checkInAt: reg.checkInAt,
            participant: {
                id: reg.participant.id,
                fullName: reg.participant.fullName,
                email: reg.participant.email,
            },
            event: {
                id: reg.event.id,
                title: reg.event.title,
                dateTime: reg.event.dateTime,
                locationText: reg.event.locationText,
            },
        };
    }
    async cancelByParticipant(registrationId: number, participant: User) {
        const reg = await this.registrationsRepo.findOne({
            where: { id: registrationId },
            relations: ["event", "participant"],
        });

        if (!reg) {
            throw new NotFoundException("Inscripción no encontrada");
        }

        if (reg.participant.id !== participant.id) {
            throw new ForbiddenException("Solo puedes cancelar tus propias inscripciones");
        }

        const now = new Date();
        if (reg.event.dateTime < now) {
            throw new BadRequestException("No puedes cancelar una inscripción de un evento ya realizado");
        }

        if (reg.event.price > 0 && reg.paymentProofUrl && reg.status !== "REJECTED") {
            throw new BadRequestException("No puedes cancelar una inscripción con un pago registrado. Contacta al organizador.");
        }

        await this.registrationsRepo.remove(reg);

        return { message: "Inscripción cancelada correctamente" };
    }
}
