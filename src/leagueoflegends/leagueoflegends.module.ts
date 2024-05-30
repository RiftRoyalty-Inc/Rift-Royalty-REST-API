import { Module } from '@nestjs/common';
import { LeagueoflegendsService } from './leagueoflegends.service';
import { LeagueoflegendsController } from './leagueoflegends.controller';

@Module({
  controllers: [LeagueoflegendsController],
  providers: [LeagueoflegendsService],
})
export class LeagueoflegendsModule {}
