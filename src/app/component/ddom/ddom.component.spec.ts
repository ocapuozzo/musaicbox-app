import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DdomComponent } from './ddom.component';

describe('DdomComponent', () => {
  let component: DdomComponent;
  let fixture: ComponentFixture<DdomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DdomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DdomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
