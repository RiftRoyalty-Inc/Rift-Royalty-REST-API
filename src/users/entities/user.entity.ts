import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ type: 'text', unique: false })
    email: string;

    @Column({ type: 'text', nullable: false })
    password: string;

    @Column({ type: 'enum', enum: ['admin', 'user'] })
    role: string;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column({ type: 'boolean', default: false })
    isVerified: boolean;
}
