import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusaicComponent } from './musaic.component';

describe('MusaicComponent', () => {
  let component: MusaicComponent;
  let fixture: ComponentFixture<MusaicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusaicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MusaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
