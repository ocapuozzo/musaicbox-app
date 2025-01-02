import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModulationTranspositionControlComponent} from './modulation-transposition-control.component';

describe('ModuleTranslationControlComponent', () => {
  let component: ModulationTranspositionControlComponent;
  let fixture: ComponentFixture<ModulationTranspositionControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulationTranspositionControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulationTranspositionControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
