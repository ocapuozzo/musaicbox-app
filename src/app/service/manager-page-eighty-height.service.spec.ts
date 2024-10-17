import { TestBed } from '@angular/core/testing';

import { ManagerPageEightyHeightService } from './manager-page-eighty-height.service';

describe('ManagerPageEightyHeightService', () => {
  let service: ManagerPageEightyHeightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPageEightyHeightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
