import { Module, forwardRef } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationController } from './email-verification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EmailVerification]),
        forwardRef(() => UsersModule)
    ],
    controllers: [EmailVerificationController],
    providers: [EmailVerificationService],
    exports: [EmailVerificationService]
})
export class EmailVerificationModule { }
