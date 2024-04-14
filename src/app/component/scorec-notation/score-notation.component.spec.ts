import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreNotationComponent } from './score-notation.component';

describe('MusicNotationComponent', () => {
  let component: ScoreNotationComponent;
  let fixture: ComponentFixture<ScoreNotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreNotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreNotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
