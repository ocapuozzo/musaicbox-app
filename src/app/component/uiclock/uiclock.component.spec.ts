import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiclockComponent } from './uiclock.component';

describe('UiclockComponent', () => {
  let component: UiclockComponent;
  let fixture: ComponentFixture<UiclockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiclockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UiclockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
