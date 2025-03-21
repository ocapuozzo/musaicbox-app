import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarForWhiteBoardComponent } from './toolbar-for-white-board.component';

describe('ToolbarForWhiteBoardComponent', () => {
  let component: ToolbarForWhiteBoardComponent;
  let fixture: ComponentFixture<ToolbarForWhiteBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarForWhiteBoardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToolbarForWhiteBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
