import { TestBed } from '@angular/core/testing';

import { ManagerPcsService } from './manager-pcs.service';

describe('ManagerPcsService', () => {
  let service: ManagerPcsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPcsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
