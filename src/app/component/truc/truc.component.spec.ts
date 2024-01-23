import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrucComponent } from './truc.component';

describe('TrucComponent', () => {
  let component: TrucComponent;
  let fixture: ComponentFixture<TrucComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrucComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrucComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
