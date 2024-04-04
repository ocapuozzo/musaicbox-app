import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatDrawerMode, MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {BooleanInput} from '@angular/cdk/coercion';
import {BreakpointObserver} from '@angular/cdk/layout';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faCoffee, IconDefinition} from '@fortawesome/free-solid-svg-icons';
import {faCat} from '@fortawesome/free-solid-svg-icons';
import {faGuitar} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faGithub} from '@fortawesome/free-brands-svg-icons';
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IPcs} from "./core/IPcs";
import {ManagerPagePcsService} from "./service/manager-page-pcs.service";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {GroupAction} from "./core/GroupAction";
import {Group} from "./core/Group";
import {ManagerPagePcsListService} from "./service/manager-page-pcs-list.service";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, FontAwesomeModule,
    FormsModule, ReactiveFormsModule, MatFormField, MatInput
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MusaicApp';
  mdcBackdrop: BooleanInput = false;
  drawerMode: MatDrawerMode = "push";
  faCoffee = faCoffee;
  faCat: IconDefinition = faCat
  faGuitar = faGuitar
  faGithub = faGithub

  readonly breakpoint$ = this.breakpointObserver
    .observe(['(max-width: 500px)']);

  checkoutForm = this.formBuilder.group({
    pcsStr: ''
  });

  // TODO unit test problem

  constructor(private formBuilder: FormBuilder,
              private readonly managerHomePcsService: ManagerPagePcsService,
              private readonly managerHomePcsListService: ManagerPagePcsListService,
              private readonly breakpointObserver: BreakpointObserver,
              private readonly router: Router) {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanges()
    );
  }

  breakpointChanges(): void {
    if (this.breakpointObserver.isMatched('(max-width: 500px)')) {
      this.drawerMode = "over";
      this.mdcBackdrop = true;
    } else {
      this.drawerMode = "push";
      this.mdcBackdrop = false;
    }
  }

  onSubmit(): void {
    // console.log('pscStr = ', this.checkoutForm.value.pcsStr?.trim());
    if (this.checkoutForm.value.pcsStr) {

      let pcsString = this.checkoutForm.value.pcsStr.trim() ?? ''

      // replace sep _ or space by comma
      pcsString = pcsString.replace(/[ _]/g, ",").trim();

      if (pcsString) {
        if (pcsString.startsWith('iv:')) {
          this.searchPcsWithThisIV(pcsString.substring(3))
        } else {
          try {
            let pcs = new IPcs({strPcs: pcsString})
            if (pcs.cardinal > 0) {
              this.checkoutForm.reset();
              this.managerHomePcsService.replaceBy(pcs)
              this.router.navigateByUrl('/pcs');
            }
          } catch (e: any) {
          }
        }
      }
    }
  }

  private searchPcsWithThisIV(searchIV: string) {
    const pcsWithSameIV: IPcs[] = []
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    for (const orbit of groupCyclic.orbits) {
      const pcsPF = orbit.getPcsMin()
      if (pcsPF.iv().toString() == searchIV) {
        pcsWithSameIV.push(pcsPF)
      }
    }
    // console.log("pcsWithSameIV : " + pcsWithSameIV)
    if (pcsWithSameIV.length > 0) {
      // select the first of list as current pcs
      this.managerHomePcsService.replaceBy(pcsWithSameIV[0])
      // push all pcs havine same IV into list pcs of pcs page
      for (const pcs of pcsWithSameIV) {
        this.managerHomePcsListService.addPcs('iv:' + searchIV, pcs)
      }
      this.router.navigateByUrl('/pcs');
    }

  }

}
