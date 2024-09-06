import { TestBed } from '@angular/core/testing';

import { ClipboardService } from './clipboard.service';
import {IPcs} from "../core/IPcs";

describe('ClipboardService', () => {
  let service: ClipboardService<IPcs[]>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClipboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
