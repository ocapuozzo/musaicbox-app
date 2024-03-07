import { ComponentFixture, TestBed } from '@angular/core/testing';

import { The88Component } from './the88.component';

describe('The88Component', () => {
  let component: The88Component;
  let fixture: ComponentFixture<The88Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [The88Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(The88Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
