// src/users/user.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../roles/role.entity";
import { Exclude } from "class-transformer";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string;

    @ManyToOne(() => Role, role => role.users, { eager: true })
    role: Role;
}
