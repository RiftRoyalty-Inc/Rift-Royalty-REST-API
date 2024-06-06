import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailVerificationModule } from 'src/email-verification/email-verification.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { SummonerModule } from 'src/summoner/summoner.module';
@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => EmailVerificationModule),
        AuthenticationModule,
        forwardRef(() => SummonerModule)
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule { }
