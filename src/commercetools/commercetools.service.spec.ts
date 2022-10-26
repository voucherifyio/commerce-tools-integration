import { Test, TestingModule } from '@nestjs/testing';
import { CommercetoolsService } from './commercetools.service';

describe('CommerceToolsService', () => {
  let service: CommercetoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommercetoolsService],
    }).compile();

    service = module.get<CommercetoolsService>(CommercetoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
