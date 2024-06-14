import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcsComponent } from './pcs.component';

describe('PcsComponent', () => {
  let component: PcsComponent;
  let fixture: ComponentFixture<PcsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PcsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
