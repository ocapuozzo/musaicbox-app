import { TestBed } from '@angular/core/testing';

import { ManagerPagePcsService } from './manager-page-pcs.service';

describe('ManagerHomePcsService', () => {
  let service: ManagerPagePcsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPagePcsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
