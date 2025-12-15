import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThanOrEqual, In } from "typeorm";
import { Not, IsNull } from "typeorm";
import { Event } from "./entities/event.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { User } from "../users/entities/user.entity";
import { Registration } from "../registrations/entities/registration.entity";

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly eventsRepo: Repository<Event>,
        @InjectRepository(Registration)
        private readonly registrationsRepo: Repository<Registration>,
    ) {}

    async create(createEventDto: CreateEventDto, creator: User) {
        const eventDate = new Date(createEventDto.dateTime);
        const now = new Date();

        if (eventDate < now) {
            throw new BadRequestException("La fecha y hora del evento deben ser iguales o posteriores a la fecha actual :P");
        }

        const event = this.eventsRepo.create({
            title: createEventDto.title,
            description: createEventDto.description,
            dateTime: eventDate,
            locationText: createEventDto.locationText,
            latitude: createEventDto.latitude ?? null,
            longitude: createEventDto.longitude ?? null,
            capacityMax: createEventDto.capacityMax,
            price: createEventDto.price,
            imagePath: createEventDto.imagePath ?? null,
            createdBy: creator,
        });

        return this.eventsRepo.save(event);
    }
    async findPublic() {
        const now = new Date();

        return this.eventsRepo.find({
            where: {
                dateTime: MoreThanOrEqual(now),
            },
            order: { dateTime: "ASC" },
        });
    }

    async findByCreator(creatorId: number) {
        return this.eventsRepo.find({
            where: { createdBy: { id: creatorId } },
            order: { dateTime: "ASC" },
            relations: ["createdBy"],
        });
    }

    async findOne(id: number) {
        const event = await this.eventsRepo.findOne({
            where: { id },
            relations: ["createdBy"],
        });
        if (!event) throw new NotFoundException("Evento no encontrado :c");
        return event;
    }

    async update(id: number, updateEventDto: UpdateEventDto) {
        const event = await this.findOne(id);

        if (updateEventDto.dateTime) {
            const newDate = new Date(updateEventDto.dateTime);
            const now = new Date();

            if (newDate < now) {
                throw new BadRequestException("No puedes cambiar la fecha del evento a una fecha pasada");
            }

            event.dateTime = newDate;
        }

        if (updateEventDto.capacityMax !== undefined) {
            const activeCount = await this.registrationsRepo.count({
                where: {
                    event: { id },
                    status: In(["PENDING", "ACCEPTED"]),
                },
            });

            if (updateEventDto.capacityMax < activeCount) {
                throw new BadRequestException(`No puedes establecer una capacidad menor a las inscripciones activas (${activeCount})`);
            }

            event.capacityMax = updateEventDto.capacityMax;
        }

        if (updateEventDto.title !== undefined) event.title = updateEventDto.title;
        if (updateEventDto.description !== undefined) event.description = updateEventDto.description;
        if (updateEventDto.locationText !== undefined) event.locationText = updateEventDto.locationText;
        if (updateEventDto.latitude !== undefined) event.latitude = updateEventDto.latitude;
        if (updateEventDto.longitude !== undefined) event.longitude = updateEventDto.longitude;
        if (updateEventDto.price !== undefined) event.price = updateEventDto.price;

        return this.eventsRepo.save(event);
    }

    async updateImagePath(id: number, imagePath: string) {
        const event = await this.findOne(id);
        event.imagePath = imagePath;
        return this.eventsRepo.save(event);
    }
    async getStatsForEvent(id: number, organizer: User) {
        const event = await this.eventsRepo.findOne({
            where: { id },
            relations: ["createdBy"],
        });

        if (!event) {
            throw new NotFoundException("Evento no encontrado");
        }

        if (event.createdBy.id !== organizer.id) {
            throw new ForbiddenException("Solo puedes ver las stats de eventos que creaste");
        }

        const totalRegistrations = await this.registrationsRepo.count({
            where: { event: { id } },
        });

        const pending = await this.registrationsRepo.count({
            where: { event: { id }, status: "PENDING" },
        });

        const accepted = await this.registrationsRepo.count({
            where: { event: { id }, status: "ACCEPTED" },
        });

        const rejected = await this.registrationsRepo.count({
            where: { event: { id }, status: "REJECTED" },
        });

        const checkedIn = await this.registrationsRepo.count({
            where: {
                event: { id },
                checkInAt: Not(IsNull()),
            },
        });

        const freeSlots = Math.max(event.capacityMax - accepted, 0);

        return {
            eventId: event.id,
            title: event.title,
            dateTime: event.dateTime,
            capacityMax: event.capacityMax,
            totalRegistrations,
            pending,
            accepted,
            rejected,
            checkedIn,
            freeSlots,
        };
    }
    async remove(id: number) {
        const event = await this.eventsRepo.findOne({ where: { id } });

        if (!event) {
            throw new NotFoundException("Evento no encontrado");
        }

        const activeCount = await this.registrationsRepo.count({
            where: {
                event: { id },
                status: In(["PENDING", "ACCEPTED"]),
            },
        });

        if (activeCount > 0) {
            throw new BadRequestException("No puedes eliminar un evento que tiene inscripciones pendientes o aceptadas");
        }

        await this.eventsRepo.remove(event);

        return { message: "Evento eliminado correctamente :3" };
    }
}
