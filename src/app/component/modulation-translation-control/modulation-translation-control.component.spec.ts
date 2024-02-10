import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulationTranslationControlComponent } from './modulation-translation-control.component';

describe('ModuleTranslationControlComponent', () => {
  let component: ModulationTranslationControlComponent;
  let fixture: ComponentFixture<ModulationTranslationControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulationTranslationControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulationTranslationControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
