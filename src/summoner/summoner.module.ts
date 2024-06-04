import { Module } from '@nestjs/common';
import { SummonerService } from './summoner.service';
import { SummonerController } from './summoner.controller';
import { MatchModule } from 'src/match/match.module';

@Module({
    imports: [MatchModule],
    controllers: [SummonerController],
    providers: [SummonerService],
    exports: [SummonerService]
})
export class SummonerModule { }
