import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RectSelectorComponent } from './rect-selector.component';

describe('RectSelecterComponent', () => {
  let component: RectSelectorComponent;
  let fixture: ComponentFixture<RectSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RectSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
