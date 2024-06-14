import { TestBed } from '@angular/core/testing';

import { ManagerPageWBService } from './manager-page-wb.service';

describe('ManagerPageWBService', () => {
  let service: ManagerPageWBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPageWBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
