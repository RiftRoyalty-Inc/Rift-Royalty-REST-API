import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SummonerService } from './summoner.service';

@Controller('summoners')
export class SummonerController {
    constructor(private readonly summonerService: SummonerService) { }

    @Get('puuid')
    getPuuid(
        @Query('gameName') gameName: string,
        @Query('tagLine') tagLine: string,
        @Query('region') region: string,
    ) {
        return this.summonerService.getPuuid(tagLine, gameName, region);
    }

    @Get('summonericon')
    getSummonerIcon(
        @Query('gameName') gameName: string,
        @Query('tagLine') tagLine: string,
        @Query('region') region: string,
    ) {
        return this.summonerService.getSummonerIcon(gameName, tagLine, region);
    }

    @Post('linkaccount')
    linkAccount(
        @Query('gameName') gameName: string,
        @Query('tagLine') tagLine: string,
        @Query('region') region: string,
        @Query('iconId') currentIconId: string,
    ) {
        return this.summonerService.linkAccount(gameName, tagLine, region, currentIconId);
    }

    @Get('top-players-world')
    getTopPlayersWorld(
        @Query('region') region: string,
    ) {
        if (region == null || region == "") {
            region = "euw1"
        }
        console.log(region);
        return this.summonerService.getTopPlayersWorld(region);
    }
}
