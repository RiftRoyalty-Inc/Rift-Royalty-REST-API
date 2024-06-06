import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Import JwtService from @nestjs/jwt
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class AuthenticationService {
    constructor(private readonly jwtService: JwtService) { } // Inject JwtService

    async SendAuthCode(email: string) {
        return `X000?`;
    }

    async generateJwtToken(user: User): Promise<string> {
        const payload = { userId: user.id, email: user.email };
        return this.jwtService.sign(payload); // Generate a JWT token with the provided payload
    }
    async compareJwtToken(userToken: string){
        return this.jwtService.decode(userToken);
    }
}
