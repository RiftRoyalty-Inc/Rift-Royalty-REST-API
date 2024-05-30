import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchesService {

    async findAll(search: string, region:string) {
        console.log(search);
        const requestBody = {
            "operationName": "LolSearchQuery",
            "variables": {
                "region": `${region}`,
                "text": `${search}`
            },
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": "121904bc8dec8ac7656566373d42a82514e022979af0d8aefe676d3afdb5281c"
                }
            }
        };
        console.log(requestBody);
        const requestBodyString = JSON.stringify(requestBody);
        const url = "https://mobalytics.gg/api/lol/graphql/v1/query";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBodyString
        }).then(response => {return response.json()}).then(data => {return data.data.search});
        return response;
    }

}
