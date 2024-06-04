import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '60s' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService],
    exports: [AuthenticationService], // Export AuthenticationService to be used in other modules
})
export class AuthenticationModule { }
