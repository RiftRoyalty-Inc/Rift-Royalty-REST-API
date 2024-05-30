import { Injectable } from '@nestjs/common';
import { CreateEmailVerificationDto } from './dto/create-email-verification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailVerificationService {
    constructor(
        private readonly mailerService: MailerService,
        @InjectRepository(EmailVerification) private readonly emailVerificationRepository: Repository<EmailVerification>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) { }

    async sendVerificationEmail(emailObj: { email: string }) {
        const email = emailObj.email.trim();
        console.log(`Email to find: '${email}'`);
        const user = await this.userRepository.findOne({ where: { email } });
        console.log(user);
        if (!user) {
            throw new Error('User not found');
        }

        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1);
        const code = this.generateVerificationCode();
        const createEmailVerificationDto: CreateEmailVerificationDto = {
            verification_code: code,
            created_at: new Date(),
            expires_at: expirationDate,
            user_id: user.id,
        }
        const emailVerification = this.emailVerificationRepository.create(createEmailVerificationDto);
        const res = await this.emailVerificationRepository.save(emailVerification);
        await this.mailerService.sendMail({
            to: email,
            subject: 'Email Verification',
            template: './verification',
            context: {
                code,
            },
        });
        if (res) {
            return `{"code": "1", "msg": "OK"}`;
        } else {
            return `{"code": "0", "msg": "NOT_OK"}`;
        }
    }

    async resendVerificationEmail(emailObj: { email: string }) {
        await this.removeVerification(emailObj);
        return this.sendVerificationEmail(emailObj);
    }

    async removeVerification(emailObj:{email: string}){
        const email = emailObj.email.trim();
        const user = await this.userRepository.findOne({ where: { email, isVerified: false } });
        console.log('deleting . . .')
        const emailVerification = await this.emailVerificationRepository.findOne({ where: { user_id: user.id } });
        if (!emailVerification) {
            console.log('email verification not found');
            return false;
        }
        console.log('# deleted #')
        await this.emailVerificationRepository.delete(emailVerification);
    }

    async verifyCode(authObj: { email: string, code: string }) {
        const email = authObj.email.trim();
        const code = authObj.code.trim();
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return false;
        }
        const emailVerification = await this.emailVerificationRepository.findOne({ where: { user_id: user.id, verification_code: code } });
        const alreadyVerified = await this.userRepository.findOne({ where: { email: email, isVerified: true } });
        if (alreadyVerified) {
            return `{"code": "1", "msg": "User is already verified!"}`;
        } else {
            if (!emailVerification) {
                console.log('Email verification not found');
                return `{"code": "0", "msg": "Code is incorrect!"}`;
            }

            const now = new Date();
            if (now > emailVerification.expires_at) {
                console.log('Email verification expired');
                return false;
            }
            user.isVerified = true;
            await this.userRepository.save(user);
            await this.emailVerificationRepository.remove(emailVerification);
            return true;
        }
    }

    private generateVerificationCode(): string {
        const min = 1000; // The smallest 4-digit number
        const max = 9999; // The largest 4-digit number
        const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomCode.toString();
    }
}
