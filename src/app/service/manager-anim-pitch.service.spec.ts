import {TestBed} from '@angular/core/testing';

import {ManagerAnimPitchService} from './manager-anim-pitch.service';

describe('AnimPitchService', () => {
  let service: ManagerAnimPitchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerAnimPitchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
