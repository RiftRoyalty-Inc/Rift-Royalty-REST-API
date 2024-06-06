import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
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
        gameName = gameName.toLowerCase();
        tagLine = tagLine.toLowerCase();
        region = region.toUpperCase();
        return this.summonerService.getPuuid(tagLine, gameName, region);
    }

    @Get('summonericon')
    getSummonerIcon(
        @Query('gameName') gameName: string,
        @Query('tagLine') tagLine: string,
        @Query('region') region: string,
    ) {
        gameName = gameName.toLowerCase();
        tagLine = tagLine.toLowerCase();
        region = region.toUpperCase();
        return this.summonerService.getSummonerIcon(gameName, tagLine, region);
    }

    @Get('getmatches')
    getMatches(
        @Query('gameName') gameName: string,
        @Query('tagLine') tagLine: string,
        @Query('region') region: string,
    ){
        gameName = gameName.toLowerCase();
        tagLine = tagLine.toLowerCase();
        region = region.toUpperCase();
        return this.summonerService.getMatches(gameName, tagLine, region);
    }
    @Post('linkaccount')
    linkAccount(
        @Query('gameName') gameName: string,
        @Query('tagLine') tagLine: string,
        @Query('region') region: string,
        @Query('profileIconId') currentIconId: string,
        @Query('newIcon') iconToChangeTo: string,
        @Headers('userToken') userToken: string,
    ) {
        gameName = gameName.toLowerCase();
        tagLine = tagLine.toLowerCase();
        region = region.toUpperCase();
        return this.summonerService.linkAccount(gameName, tagLine, region, currentIconId, iconToChangeTo, userToken);
    }

    @Get('top-players-world')
    getTopPlayersWorld(
        @Query('region') region: string,
    ) {
        region = region.toUpperCase();
        return this.summonerService.getTopPlayersWorld(region);
    }
}
