import { TestBed } from '@angular/core/testing';

import { AnimPitchService } from './anim-pitch.service';

describe('AnimPitchService', () => {
  let service: AnimPitchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimPitchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
