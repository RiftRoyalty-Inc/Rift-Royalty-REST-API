import { Injectable } from '@nestjs/common';

@Injectable()
export class NewsService {

  findAll() {
    return `This action returns all news`;
  }

  findOne(id: number) {
    return `This action returns a #${id} news`;
  }

}
