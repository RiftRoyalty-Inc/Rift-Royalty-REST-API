import { Module, forwardRef } from '@nestjs/common';
import { SummonerService } from './summoner.service';
import { SummonerController } from './summoner.controller';
import { MatchModule } from 'src/match/match.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { UsersModule } from 'src/users/users.module';
@Module({
    imports: [
        MatchModule,
        AuthenticationModule,
        forwardRef(() => UsersModule)
    ],
    controllers: [SummonerController],
    providers: [SummonerService],
    exports: [SummonerService]
})
export class SummonerModule { }
