import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { CreateEmailVerificationDto } from './dto/create-email-verification.dto';
import { UpdateEmailVerificationDto } from './dto/update-email-verification.dto';

@Controller('email-verification')
export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationService) { }

    @Post('send')
    create(@Body() emailObj: { email: string }) {
        emailObj.email = emailObj.email.trim();
        emailObj.email = emailObj.email.toLowerCase();
        return this.emailVerificationService.sendVerificationEmail(emailObj);
    }

    @Post('verify')
    verifyCode(@Body() authObj: { email: string, code: string }) {
        authObj.email = authObj.email.trim();
        authObj.email = authObj.email.toLowerCase();
        return this.emailVerificationService.verifyCode(authObj);
    }

    @Post('resend')
    resendVerificationEmail(@Body() authObj: { email: string }) {
        authObj.email = authObj.email.trim();
        authObj.email = authObj.email.toLowerCase();
        return this.emailVerificationService.resendVerificationEmail(authObj);
    }

}
