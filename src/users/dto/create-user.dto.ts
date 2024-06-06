export class CreateUserDto {
    username: string;
    password: string;
    email: string;
    role: string;
    active: boolean;
    isVerified: boolean;
    puuid: string;
    region: string;
}