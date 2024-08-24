import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcsPageComponent } from './pcs-page.component';

describe('HomeComponent', () => {
  let component: PcsPageComponent;
  let fixture: ComponentFixture<PcsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PcsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
