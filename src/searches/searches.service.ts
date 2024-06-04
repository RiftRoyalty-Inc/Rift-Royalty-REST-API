import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchesService {

    async findAll(search: string, region:string) {
        const requestBody = {
            "operationName": "LolSearchQuery",
            "variables": {
                "region": `${region}`,
                "text": `${search}`
            },
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": "e50fb70014ec2a1df173836ee403cbed27f0314e32579f54f0c3f72a380e8cbc"
                }
            }
        };
        const requestBodyString = JSON.stringify(requestBody);
        const url = "https://mobalytics.gg/api/lol/graphql/v1/query";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBodyString
        }).then(response => {return response.json()}).then(data => {console.log(data.data.search); return data.data.search});
        return response;
    }

}
