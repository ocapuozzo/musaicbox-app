import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiOrbitComponent } from './ui-orbit.component';

describe('OrbitComponent', () => {
  let component: UiOrbitComponent;
  let fixture: ComponentFixture<UiOrbitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiOrbitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiOrbitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
