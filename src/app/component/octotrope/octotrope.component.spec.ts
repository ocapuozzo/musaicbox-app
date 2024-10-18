import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OctotropeComponent} from './octotrope.component';

describe('OctotropeComponent', () => {
  let component: OctotropeComponent;
  let fixture: ComponentFixture<OctotropeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OctotropeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OctotropeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
