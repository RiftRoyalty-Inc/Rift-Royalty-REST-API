import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'process';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { SummonerModule } from './summoner/summoner.module';
import { LeagueoflegendsModule } from './leagueoflegends/leagueoflegends.module';
import { NewsModule } from './news/news.module';
import { SearchesModule } from './searches/searches.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailVerificationModule } from './email-verification/email-verification.module';
// Autorizar comunicacion porque si no dara error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: +configService.get('DB_PORT'),
                username: configService.get('DB_USER'),
                password: configService.get('DB_PWD'),
                database: configService.get('DB_NAME'),
                entities: [join(process.cwd(), 'dist/**/*.entity{.ts,.js}')],
                synchronize: true,
                ssl: true,
            }),
        }),
        UsersModule,
        SummonerModule,
        LeagueoflegendsModule,
        NewsModule,
        SearchesModule,
        AuthenticationModule,
        EmailVerificationModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get<string>('SMTP_HOST'),
                    port: configService.get<number>('SMTP_PORT'),
                    secure: false,
                    auth: {
                        user: configService.get<string>('SMTP_USER'),
                        pass: configService.get<string>('SMTP_PASS'),
                    },
                },
                defaults: {
                    from: configService.get<string>('SMTP_FROM'),
                },
                template: {
                    dir: join(__dirname, '..', 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
