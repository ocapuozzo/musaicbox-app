import { TestBed} from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import {RouterTestingModule} from "@angular/router/testing";

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // adding RouterTestingModule in imports else NullInjectorError: No provider for ActivatedRoute!
      imports: [AppComponent, RouterTestingModule],
      providers: [provideAnimations()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'MusaicBoxApp' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toContain('MusaicApp');
  });


});
