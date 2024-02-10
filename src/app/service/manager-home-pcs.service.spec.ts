import { TestBed } from '@angular/core/testing';

import { ManagerHomePcsService } from './manager-home-pcs.service';

describe('ManagerHomePcsService', () => {
  let service: ManagerHomePcsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerHomePcsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
