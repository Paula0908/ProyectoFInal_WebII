// src/events/entities/event.entity.ts
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Registration } from "../../registrations/entities/registration.entity";

@Entity("events")
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: "text" })
    description: string;

    @Column({ type: "datetime" })
    dateTime: Date;

    @Column()
    locationText: string;

    @Column({ type: "real", nullable: true })
    latitude: number | null;

    @Column({ type: "real", nullable: true })
    longitude: number | null;

    @Column()
    capacityMax: number;

    @Column({ type: "real", default: 0 })
    price: number;

    @Column({ type: "text", nullable: true })
    imagePath: string | null;

    @ManyToOne(() => User)
    createdBy: User;

    @OneToMany(() => Registration, (reg: Registration) => reg.event)
    registrations: Registration[];
}
