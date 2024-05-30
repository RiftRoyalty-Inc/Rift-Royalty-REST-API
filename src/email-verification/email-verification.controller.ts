import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { CreateEmailVerificationDto } from './dto/create-email-verification.dto';
import { UpdateEmailVerificationDto } from './dto/update-email-verification.dto';

@Controller('email-verification')
export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationService) { }

    @Post('send')
    create(@Body() emailObj: { email: string }) {
        return this.emailVerificationService.sendVerificationEmail(emailObj);
    }

    @Post('verify')
    verifyCode(@Body() authObj: { email: string, code: string }) {
        return this.emailVerificationService.verifyCode(authObj);
    }

    @Post('resend')
    resendVerificationEmail(@Body() authObj: { email: string }) {
        return this.emailVerificationService.resendVerificationEmail(authObj);
    }

}
