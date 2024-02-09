import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleTranslationControlComponent } from './module-translation-control.component';

describe('ModuleTranslationControlComponent', () => {
  let component: ModuleTranslationControlComponent;
  let fixture: ComponentFixture<ModuleTranslationControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleTranslationControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModuleTranslationControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
