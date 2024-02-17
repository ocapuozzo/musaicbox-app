import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcsListComponent } from './pcs-list.component';

describe('PcsListComponent', () => {
  let component: PcsListComponent;
  let fixture: ComponentFixture<PcsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PcsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
