import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMusaicComponent } from './ui-musaic.component';

describe('UiMusaicComponent', () => {
  let component: UiMusaicComponent;
  let fixture: ComponentFixture<UiMusaicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMusaicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UiMusaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
