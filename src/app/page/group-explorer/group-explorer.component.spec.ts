import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupExplorerComponent } from './group-explorer.component';

describe('GroupExplorerComponent', () => {
  let component: GroupExplorerComponent;
  let fixture: ComponentFixture<GroupExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupExplorerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
