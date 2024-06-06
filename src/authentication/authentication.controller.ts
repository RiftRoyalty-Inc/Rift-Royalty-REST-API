import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) { }

    @Get('sendauthcode')
    SendAuthCode(
        @Query('email') email: string
    ) {
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: 'zekrom.manel@gmail.com', // Change to your recipient
            from: 'ryugaele2@gmail.com', // Change to your verified sender
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        }
        sgMail
            .send(msg)
            .then(() => {
            })
            .catch((error) => {
                console.error(error)
            })
        return this.authenticationService.SendAuthCode(email);
    }

    @Post('comparetoken')
    compareToken(@Headers('userToken') userToken: string) {
        return this.authenticationService.compareJwtToken(userToken);
    }

}
