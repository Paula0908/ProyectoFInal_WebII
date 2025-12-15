// src/registrations/entities/registration.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Event } from "../../events/entities/event.entity";

@Entity("registrations")
@Unique(["event", "participant"])
export class Registration {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Event, event => event.registrations)
    event: Event;

    @ManyToOne(() => User)
    participant: User;

    // PENDING / ACCEPTED / REJECTED
    @Column({ type: "text", default: "PENDING" })
    status: string;

    @Column({ type: "text", nullable: true })
    paymentProofUrl: string | null;

    @Column({ type: "text", nullable: true, unique: true })
    qrToken: string | null;

    @Column({ type: "datetime", nullable: true })
    checkInAt: Date | null;
}
