import { TestBed } from '@angular/core/testing';

import { ManagerPagePcsListService } from './manager-page-pcs-list.service';

describe('ManagerHomePcsListService', () => {
  let service: ManagerPagePcsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPagePcsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
