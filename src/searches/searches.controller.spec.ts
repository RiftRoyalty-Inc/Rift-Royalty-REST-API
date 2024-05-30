import { Test, TestingModule } from '@nestjs/testing';
import { SearchesController } from './searches.controller';
import { SearchesService } from './searches.service';

describe('SearchesController', () => {
  let controller: SearchesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchesController],
      providers: [SearchesService],
    }).compile();

    controller = module.get<SearchesController>(SearchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
