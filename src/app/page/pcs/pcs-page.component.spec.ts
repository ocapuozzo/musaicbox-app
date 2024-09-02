
/*

TODO : problem with ActivateRoute...

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcsPageComponent } from './pcs-page.component';
import {ActivatedRoute, RouterModule} from "@angular/router";
import {of} from "rxjs";


describe('PcsPageComponent', () => {
  let component: PcsPageComponent;
  let fixture: ComponentFixture<PcsPageComponent>;
  const mockActivatedRoute = {
    queryParams: of({ pid: '42' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcsPageComponent,
        RouterModule. forRoot(
          [{"path": 'pcs/pid', "data": mockActivatedRoute }]
        )
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue:  mockActivatedRoute
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PcsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
*/
