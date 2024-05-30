import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "email_verification"})
export class EmailVerification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "text"})
    verification_code: string;

    @Column({type:"date", default: () => "CURRENT_TIMESTAMP"})
    expires_at: Date;

    @Column({type:"date", default: () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    @Column({type:"int"})
    user_id: number;
}