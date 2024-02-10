import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiClockComponent } from './ui-clock.component';

describe('UiclockComponent', () => {
  let component: UiClockComponent;
  let fixture: ComponentFixture<UiClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiClockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
