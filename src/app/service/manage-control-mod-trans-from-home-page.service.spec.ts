import { TestBed } from '@angular/core/testing';

import { ManageControlModTransFromHomePageService } from './manage-control-mod-trans-from-home-page.service';

describe('ManageControlModTransFromHomePageService', () => {
  let service: ManageControlModTransFromHomePageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageControlModTransFromHomePageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
