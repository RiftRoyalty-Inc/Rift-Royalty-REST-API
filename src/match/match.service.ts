import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {

    constructor() { }

    async getMatchesByPuuid(puuid: string) {
        const URL = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`;
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        const data = await response.json();

        const matchPromises = data.map(async match => {
            return await this.getMatches(match, puuid);
        });
        const matchArray = await Promise.all(matchPromises);
        return matchArray;
    }

    async getMatches(matchId: string, puuid: string) {
        const URL = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        const data = await response.json();
        const matchInfo = data.info;
        const participantInfo = matchInfo.participants.find(p => p.puuid === puuid);
        const queueType = await this.parseQueueId(matchInfo.queueId);
        const timeAgo = this.parseUnixEpoch(matchInfo.gameEndTimestamp);
        const championNamePromise = await this.parseChampionNameId(participantInfo.championName);
        const championName = await championNamePromise;
        const summonerSpell1Promise = await this.parseSummonerSpellId(participantInfo.summoner1Id);
        const summonerSpell1Name = await summonerSpell1Promise.id;
        const summonerSpell2Promise = await this.parseSummonerSpellId(participantInfo.summoner2Id);
        const summonerSpell2Name = await summonerSpell2Promise.id;
        const match = {
            type: queueType,
            timeAgo: timeAgo,
            duration: matchInfo.gameDuration,
            champion:{
                name: championName,
                icon: `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${participantInfo.championName}.png`,
                summonerSpells:[
                    `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/spell/${summonerSpell1Name}.png`,
                    `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/spell/${summonerSpell2Name}.png`,
                ],
                runes:[
                    
                ]
            }
        };
        this.parseChampionNameId(participantInfo.championName);
        return match;
    }

    async parseSummonerSpellId(spellId: number) {
        const spellJson = await fetch('https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/summoner.json').then(response => response.json());
        // const spellName = spellJson.data[Object.keys(spellJson.data)[spellId]].key;
        const spellName = spellJson.data[Object.keys(spellJson.data)[spellId]];
        console.log(spellName);
        return spellName;
    }

    async parseQueueId(queueId: number) {
        const queuesJson = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json').then(response => response.json());
        const mapType = queuesJson.find(queue => queue.queueId === queueId).description;
        return mapType;
    }

    async parseChampionNameId(championNameId: string) {
        const championJson = await fetch('https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/champion.json').then(response => response.json());
        const championName = championJson.data[championNameId].name;
        return championName;
    }

    parseUnixEpoch(gameEndTimestamp: number): string {
        const currentTime = Date.now();
        const milliseconds = currentTime - gameEndTimestamp;
        const seconds = Math.floor((milliseconds / 1000) % 60);
        const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
        const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

        let timeAgo = '';
        if (days > 0) {
            timeAgo += `${days} days `;
        }
        if (hours > 0) {
            timeAgo += `${hours} hours `;
        }
        if (minutes > 0) {
            timeAgo += `${minutes} minutes `;
        }
        if (seconds > 0) {
            timeAgo += `${seconds} seconds `;
        }
        return timeAgo.trim();
    }
}
