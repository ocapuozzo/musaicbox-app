import {ComponentFixture, TestBed} from '@angular/core/testing';
import {The88Component} from './the88.component';
import {provideAnimations} from "@angular/platform-browser/animations";

describe('The88Component', () => {
  let component: The88Component;
  let fixture: ComponentFixture<The88Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [The88Component],
      providers: [provideAnimations()]
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
