import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcsAnalysisComponent } from './pcs-analysis.component';

describe('PcsAnalysisComponent', () => {
  let component: PcsAnalysisComponent;
  let fixture: ComponentFixture<PcsAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcsAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PcsAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
