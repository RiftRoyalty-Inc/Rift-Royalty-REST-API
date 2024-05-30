import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SearchesService } from './searches.service';

@Controller('searches')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}

  @Get('champions_summoners')
  findAll(
    @Query('search') search: string,
    @Query('region') region: string,
  ) {
    console.log(search);
    return this.searchesService.findAll(search, region);
  }

}
