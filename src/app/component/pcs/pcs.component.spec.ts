import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PcsComponent} from './pcs.component';
import {provideAnimations} from "@angular/platform-browser/animations";


describe('PcsComponent', () => {
  let component: PcsComponent;
  let fixture: ComponentFixture<PcsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcsComponent],
      providers: [provideAnimations()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PcsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
   expect(component).toBeTruthy();
  });
});
