import { Injectable } from '@nestjs/common';
import { response } from 'express';
import { ConfigModule } from '@nestjs/config';

@Injectable()
export class SummonerService {
    /**
     * Retrieves the PUUID of a summoner using their tag line, game name, and region.
     *
     * @param {string} tagLine - The tag line of the summoner.
     * @param {string} gameName - The game name of the summoner.
     * @param {string} region - The region of the summoner.
     * @return {Promise<any>} - A Promise that resolves to the summoner's PUUID.
     */
    async getPuuid(tagLine: string, gameName: string, region: string) {
        if (!["EUROPE", "AMERICAS", "ASIA", "ESPORTS"].includes(region.toUpperCase())) {
            region = this.parseRegionCode(region);
        }
        console.log("get puuid . . .");
        const URL = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
        console.log(URL);
        const response =
            await fetch(`${URL}`, {
                method: 'GET',
                headers: {
                    'X-Riot-Token': process.env.API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
        const data = await response.json();
        return data.puuid;
    }

    async linkAccount(gameName: string, tagLine: string, region: string, currentIconId: string) {
        const puuid = await this.getPuuid(tagLine, gameName, region);
        console.log(puuid);
        const summoner = await this.getSummonerByPuuid(region, puuid);
        console.log(summoner);
        // Check if the passed profileIconId is the different from the current profileIconId
        // If it is, it means the user has "proven" that the account is his and can link accounts
        if (currentIconId != summoner.profileIconId) {
            console.log('true');
        } else {
            console.log('false');
        }
        // const URL = '';
        // const response = await fetch(URL, {
        //     method: 'GET',
        //     headers: {
        //         'X-Riot-Token': process.env.API_KEY,
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json',
        //     }
        // }).then(response => response.json()).then(data => data.puuid).catch(error => console.log(error));
        return 'response';
    }

    /**
     * Retrieves the top 5 players from the specified region.
     *
     * @param {string} region - The region to retrieve the players from.
     * @return {Promise<string>} A JSON string containing the top 5 players' information.
     */
    async getTopPlayersWorld(region: string) {
        const regions = ["BR1", "EUN1", "EUW1", "JP1", "KR", "LA1", "LA2", "NA1", "OC1", "PH2", "RU", "SG2", "TH2", "TR1", "TW2", "VN2"];
        let URL = "";
        URL = `https://${region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${process.env.API_KEY}`;
        console.log(URL);
        // retrieves summonerId, wins, losses, leaguePoints, uses regions euw1, na1...
        const response = await fetch(URL, {});
        console.log('== RESPONSE ==')
        console.log(response);
        const data = (await response.json()).entries;
        console.log('== DATA ==')
        console.log(data);
        const sortedData = data.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 5);
        const promises = sortedData.map(async element => {
            const summonerData = await this.getSummonerBySummonerID(element.summonerId, region);
            console.log('== SUMMONER DATA ==')
            console.log(summonerData);
            console.log('== Breaks after this? ==')
            console.log(region, summonerData.puuid);
            const detailsData = await this.getAccountByPuuid(region, summonerData.puuid);
            console.log(detailsData);
            return {
                summonerLevel: summonerData.summonerLevel,
                leaguePoints: element.leaguePoints,
                tagLine: detailsData.tagLine,
                gameName: detailsData.gameName,
                wins: element.wins,
                losses: element.losses,
                profileIconId: summonerData.profileIconId,
            };
        });

        const results = await Promise.all(promises);
        console.log('== RESULTS ==')
        console.log(results);
        let json = '[';
        let counter = 1;
        results.forEach(result => {
            json += `{"id": ${counter++}, "summonerLevel": ${result.summonerLevel}, "leaguePoints": ${result.leaguePoints}, "tagLine": "${result.tagLine}", "gameName": "${result.gameName}", "wins": ${result.wins}, "losses": ${result.losses}, "profileIconId": "${result.profileIconId}"},`;
        });
        json = json.substring(0, json.length - 1);
        json += ']';
        console.log(json);
        return json;
    }

    /**
     * Retrieves the summoner information for the given summoner ID and region.
     * id
     * accountId
     * puuid
     * profileIconId
     * revisionDate
     * summonerLevel
     * @param {string} summonerId - The ID of the summoner.
     * @param {string} region - The region where the summoner is located.
     * @return {Promise<any>} A promise that resolves to the summoner information.
     */
    async getSummonerBySummonerID(summonerId: string, region: string) {
        const URL = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}?api_key=${process.env.API_KEY}`;
        const response = await fetch(URL, {});
        const data = (await response.json());
        return data;
        // retrieves puuid, profileIconId, summonerLevel, uses regions euw1, na1...
    }

    /**
     * Retrieves the summoner information for the given region and puuid.
     * puuid
     * gameName
     * tagLine
     * @param {string} region - The region where the summoner is located.
     * @param {string} puuid - The player unique identifier.
     * @return {Promise<any>} A promise that resolves to the summoner information.
     */
    async getAccountByPuuid(region: string, puuid: string) {
        // BR1", "EUN1", "EUW1", "JP1", "KR", "LA1", "LA2", "NA1", "OC1", "PH2", "RU", "SG2", "TH2", "TR1", "TW2", "VN2
        console.log(region);
        region = this.parseRegionCode(region);
        console.log(region);
        const URL = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`;
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        console.log(URL);
        const data = (await response.json());
        console.log('get summoner by puuid');
        console.log(data);
        return data;
        // retrieves gameName, tagLine, uses continents: EUROPE, AMERICAS, ASIA, ESPORTS
    }

    /**
     * Retrieves the summoner information for the given region and puuid.
     * accountId
     * profileIconId
     * revisionDate
     * id
     * puuid
     * summonerLevel
     * @param regionCode
     * @param puuid
     * @returns
     */
    async getSummonerByPuuid(regionCode: string, puuid: string) {
        if (this.parseRegionCode(regionCode) == null) {
            console.log("e");
            regionCode = this.parseRegionCode(regionCode);
        }
        const URL = `https://${regionCode}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        const response = fetch(URL, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(response => response.json()).then(data => data).catch(error => console.log(error));
        return response;
    }

    /**
     * Returns the region name based on the input region code.
     *
     * @param {string} region - The region code to be converted.
     * @return {string} The region name corresponding to the input region code.
     */
    parseRegionCode(region: string) {
        console.log("parsing regioncode . . .")
        if (region == "BR1" || region == "LA1" || region == "LA2" || region == "NA1") {
            return "AMERICAS";
        } else if (region == "EUN1" || region == "EUW1" || region == "RU" || region == "TR1") {
            return "EUROPE"
        } else if (region == "KR" || region == "PH2" || region == "SG2" || region == "TW2" || region == "TH2" || region == "VN2") {
            return "ASIA"
        } else {
            return null;
        }
    }

    async getSummonerIcon(gameName: string, tagLine: string, region: string) {
        const puuid = await this.getPuuid(tagLine, gameName, region);
        const summoner = await this.getSummonerByPuuid(region, puuid);
        console.log(summoner.status == undefined);
        const code = summoner.status != undefined ? summoner.status.status_code : 200;
        let message = '';
        console.log(code);
        console.log(summoner)
        if (code != 200) {
            message = 'Summoner Not Found!';
        }else{
            message = 'Summoner Found';
        }
        return `{"code": "${code}", "profileIconId": "${summoner.profileIconId}", "message": "${message}"}`;

    }

}
