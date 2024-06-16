import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaggableComponent } from './daggable.component';

describe('DaggableComponent', () => {
  let component: DaggableComponent;
  let fixture: ComponentFixture<DaggableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaggableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaggableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
