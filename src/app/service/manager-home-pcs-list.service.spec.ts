import { TestBed } from '@angular/core/testing';

import { ManagerHomePcsListService } from './manager-home-pcs-list.service';

describe('ManagerHomePcsListService', () => {
  let service: ManagerHomePcsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerHomePcsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
