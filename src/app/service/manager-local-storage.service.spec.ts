import { TestBed } from '@angular/core/testing';

import { ManagerLocalStorageService } from './manager-local-storage.service';

describe('ManagerLocalStorageService', () => {
  let service: ManagerLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
