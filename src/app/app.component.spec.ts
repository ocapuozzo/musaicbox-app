import { TestBed} from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import {RouterModule} from "@angular/router";

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule. forRoot(
          [{path: '', component: AppComponent}]
        )
        ],
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
