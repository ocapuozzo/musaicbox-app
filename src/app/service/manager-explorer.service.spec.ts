import { TestBed } from '@angular/core/testing';

import { ManagerExplorerService } from './manager-explorer.service';

describe('ManagerExplorerService', () => {
  let service: ManagerExplorerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerExplorerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
