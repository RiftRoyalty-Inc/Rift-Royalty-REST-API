import { Test, TestingModule } from '@nestjs/testing';
import { LeagueoflegendsService } from './leagueoflegends.service';

describe('LeagueoflegendsService', () => {
  let service: LeagueoflegendsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeagueoflegendsService],
    }).compile();

    service = module.get<LeagueoflegendsService>(LeagueoflegendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
