import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicNotationComponent } from './music-notation.component';

describe('MusicNotationComponent', () => {
  let component: MusicNotationComponent;
  let fixture: ComponentFixture<MusicNotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicNotationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MusicNotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
