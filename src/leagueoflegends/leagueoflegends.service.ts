import { Injectable } from '@nestjs/common';

@Injectable()
export class LeagueoflegendsService {
    async findAllChampions(languageCode: string = 'en_US', patchVersion: string = '14.8.1') {
        const URL = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/${languageCode}/champion.json`;
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = response.json();
        return data;
    }

    async linkAccount(gameName: string, tagLine: string) {
        const URL = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(response => response.json()).then(data => data.puuid).catch(error => console.log(error));
        return response;
    }


}



