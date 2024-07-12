import { TestBed } from '@angular/core/testing';

import { DialogSaveAsFileNameService } from './dialog-save-as-file-name.service';

describe('DialogSaveAsFileNameService', () => {
  let service: DialogSaveAsFileNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogSaveAsFileNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
