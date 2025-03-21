import { TestBed } from '@angular/core/testing';

import { ManagerToolbarService } from './manager-toolbar.service';

describe('ManagerToolbarService', () => {
  let service: ManagerToolbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerToolbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
