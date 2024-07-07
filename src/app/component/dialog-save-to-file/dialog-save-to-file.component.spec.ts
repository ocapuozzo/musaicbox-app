import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSaveToFileComponent } from './dialog-save-to-file.component';

describe('DialogSaveToFileComponent', () => {
  let component: DialogSaveToFileComponent;
  let fixture: ComponentFixture<DialogSaveToFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSaveToFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogSaveToFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
