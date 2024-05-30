export class CreateEmailVerificationDto {
    verification_code: string;
    expires_at: Date;
    created_at: Date;
    user_id: number;
}
