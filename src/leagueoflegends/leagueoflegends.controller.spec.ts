import { Test, TestingModule } from '@nestjs/testing';
import { LeagueoflegendsController } from './leagueoflegends.controller';
import { LeagueoflegendsService } from './leagueoflegends.service';

describe('LeagueoflegendsController', () => {
  let controller: LeagueoflegendsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeagueoflegendsController],
      providers: [LeagueoflegendsService],
    }).compile();

    controller = module.get<LeagueoflegendsController>(LeagueoflegendsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
