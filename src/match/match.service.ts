import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {

    constructor() { }

    async getMatchesByPuuid(puuid: string, region: string) {
        const URL = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`;
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        const data = await response.json();
        console.log(data);
        const matchPromises = data.map(async match => {
            return await this.getMatches(match, puuid, region);
        });
        const matchArray = await Promise.all(matchPromises);
        return matchArray;
    }
    async getMatches(matchId: string, puuid: string, region:string) {
        const URL = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        console.log("buh");
        console.log(URL);
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'X-Riot-Token': process.env.API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        const data = await response.json();

        if (!data.info) {
            console.error(`No match info found for matchId: ${matchId}`);
            return null;
        }

        const matchInfo = data.info;
        const participantInfo = matchInfo.participants.find(p => p.puuid === puuid);

        if (!participantInfo) {
            console.error(`No participant info found for puuid: ${puuid} in matchId: ${matchId}`);
            return null;
        }

        const queueType = await this.parseQueueId(matchInfo.queueId);
        const timeAgo = this.parseUnixEpoch(matchInfo.gameEndTimestamp);
        const championNamePromise = await this.parseChampionNameId(participantInfo.championName);
        const championName = await championNamePromise;

        const summonerSpell1Promise = await this.parseSummonerSpellId(participantInfo.summoner1Id);
        const summonerSpell1Name = summonerSpell1Promise?.id || 'Unknown';
        const summonerSpell2Promise = await this.parseSummonerSpellId(participantInfo.summoner2Id);
        const summonerSpell2Name = summonerSpell2Promise?.id || 'Unknown';

        const rune1Promise = await this.parseRuneId(participantInfo.perks.styles[0].selections[0].perk);
        const rune2Promise = await this.parseRuneId(participantInfo.perks.styles[1].selections[0].perk);

        const gameLength = this.formatDuration(matchInfo.gameDuration);
        const rune1Icon = rune1Promise?.icon || 'default_icon.png';
        const rune2Icon = rune2Promise?.icon || 'default_icon.png';

        const kdaRatio = parseFloat(((participantInfo.kills + participantInfo.assists) / participantInfo.deaths).toFixed(2));
        const match = {
            type: queueType,
            timeAgo: `${timeAgo} ago`,
            duration: gameLength,
            champion: {
                name: championName,
                icon: `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${participantInfo.championName}.png`,
                summonerSpells: [
                    summonerSpell1Promise ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/spell/${summonerSpell1Name}.png` : 'https://i.imgur.com/HIGQKrd.png',
                    summonerSpell2Promise ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/spell/${summonerSpell2Name}.png` : 'https://i.imgur.com/HIGQKrd.png',
                ],
                runes: [
                    rune1Promise ? `https://ddragon.leagueoflegends.com/cdn/img/${rune1Icon}` : 'https://i.imgur.com/HIGQKrd.png',
                    rune2Promise ? `https://ddragon.leagueoflegends.com/cdn/img/${rune2Icon}` : 'https://i.imgur.com/HIGQKrd.png',
                ]
            },
            stats: {
                kda: `${participantInfo.kills + '/' + participantInfo.deaths + '/' + participantInfo.assists}`,
                kdaRatio: `${kdaRatio} KDA`,
                cs: `${participantInfo.totalMinionsKilled} CS`,
                csPerMin: `${parseFloat((participantInfo.totalMinionsKilled / (matchInfo.gameDuration / 60)).toFixed(2))} CS/Min`,
            },
            items: [
                participantInfo.item0 > 0 ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${participantInfo.item0}.png` : 'https://i.imgur.com/HIGQKrd.png',
                participantInfo.item1 > 0 ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${participantInfo.item1}.png` : 'https://i.imgur.com/HIGQKrd.png',
                participantInfo.item2 > 0 ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${participantInfo.item2}.png` : 'https://i.imgur.com/HIGQKrd.png',
                participantInfo.item3 > 0 ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${participantInfo.item3}.png` : 'https://i.imgur.com/HIGQKrd.png',
                participantInfo.item4 > 0 ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${participantInfo.item4}.png` : 'https://i.imgur.com/HIGQKrd.png',
                participantInfo.item5 > 0 ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${participantInfo.item5}.png` : 'https://i.imgur.com/HIGQKrd.png',
                participantInfo.item6 > 0 ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${participantInfo.item6}.png` : 'https://i.imgur.com/HIGQKrd.png',
            ],
            tags: [
                ...((participantInfo.gameEndedInSurrender || participantInfo.gameEndedInEarlySurrender) && !participantInfo.win ? ['You Surrendered :('] : []),
                ...(participantInfo.quadraKills > 0 ? ['Quadra Kill!'] : []),
                ...(participantInfo.pentaKills > 0 ? ['PENTAKILL!'] : []),
                ...(participantInfo.killingSprees > 0 ? ['Killing Spree'] : [])
            ],
            result: participantInfo.win ? 'Victory' : 'Defeat',
        };
        return match;
    }


    async parseRuneId(runeId: number) {
        console.log(`Looking up runeId: ${runeId}`);
        if (runeId == 0) {

        } else {
            const runeJson = await fetch('https://ddragon.leagueoflegends.com/cdn/14.11.1/data/en_US/runesReforged.json').then(response => response.json());
            for (const key in runeJson) {
                const styles = runeJson[key];
                for (const slotKey in styles.slots) {
                    const slot = styles.slots[slotKey];
                    for (const runeKey in slot.runes) {
                        const rune = slot.runes[runeKey];
                        if (rune.id === runeId) {
                            console.log(`Found rune for runeId: ${runeId}`);
                            return rune;
                        }
                    }
                }
            }
        }
        console.error(`Rune not found for runeId: ${runeId}`);
        return null;
    }


    async parseSummonerSpellId(spellId: number) {
        const spellJson = await fetch('https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/summoner.json').then(response => response.json());
        for (const key in spellJson.data) {
            const spell = spellJson.data[key];
            if (spell.key == spellId) {
                return spell;
            }
        }
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

    formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        let formattedDuration = '';
        if (hours > 0) {
            formattedDuration += `${hours}h `;
        }
        if (minutes > 0) {
            formattedDuration += `${minutes}m `;
        }
        if (remainingSeconds > 0 || formattedDuration === '') {
            formattedDuration += `${remainingSeconds}s`;
        }

        return formattedDuration.trim();
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
        } else {
            if (hours > 0) {
                timeAgo += `${hours} hours `;
            } else {
                if (minutes > 0) {
                    timeAgo += `${minutes} minutes `;
                }
                if (seconds > 0) {
                    timeAgo += `${seconds} seconds `;
                }
            }
        }
        return timeAgo.trim();
    }
}
