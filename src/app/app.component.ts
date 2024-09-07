import {Component, CUSTOM_ELEMENTS_SCHEMA, HostListener} from '@angular/core';
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
import {faGithub} from '@fortawesome/free-brands-svg-icons';
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IPcs} from "./core/IPcs";
import {ManagerPagePcsService} from "./service/manager-page-pcs.service";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {ManagerPagePcsListService} from "./service/manager-page-pcs-list.service";
import {MatTooltip} from "@angular/material/tooltip";
import {PcsSearch} from "./utils/PcsSearch";
import {ManagerPageWBService} from "./service/manager-page-wb.service";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, FontAwesomeModule,
    FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatTooltip
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

  p4GuitarPageActivate: boolean = false

  readonly breakpoint$ = this.breakpointObserver
    .observe(['(max-width: 500px)']);

  checkoutForm = this.formBuilder.group({
    pcsStr: ''
  });


  constructor(private formBuilder: FormBuilder,
              private readonly managerPagePcsService: ManagerPagePcsService,
              private readonly managerPagePcsListService: ManagerPagePcsListService,
              private readonly managerPageWBService: ManagerPageWBService,
              private readonly breakpointObserver: BreakpointObserver,
              private readonly router: Router) {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanges()
    );

  }

  breakpointChanges(): void {
    if (this.breakpointObserver.isMatched('(max-width: 800px)')) {
      this.drawerMode = "over";
      this.mdcBackdrop = true;
    } else {
      this.drawerMode = "push";
      this.mdcBackdrop = false;
    }
  }

  /**
   * Active, or not, P4Guitar page
   * @param event
   */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.altKey && (event.shiftKey  || event.metaKey)) {
      switch ( event.key) {
        case "g" :
          this.p4GuitarPageActivate = ! this.p4GuitarPageActivate
          break
      }
    }
  }

  /**
   *
   */
  onSubmitSearchForm(): void {
    // console.log('pscStr = ', this.checkoutForm.value.pcsStr?.trim());
    if (this.checkoutForm.value.pcsStr) {

      let pcsString = this.checkoutForm.value.pcsStr.trim() ?? ''

      // replace sep _ or space by comma
      pcsString = pcsString.replace(/[ _]/g, ",").trim();
      // replace double comma by single comma
      pcsString = pcsString.replace(/,,/g, ",").trim();

      if (pcsString) {
        if (pcsString.startsWith('iv:')) {
          this.searchPcsWithThisIV(pcsString.substring(3))
        }else if (pcsString.startsWith('is:')) {
          this.searchPcsWithThisIS(pcsString.substring(3))

      }else if (pcsString.startsWith('pid:')) {
        this.searchPcsWithThisPid(pcsString.substring(4))
      } else {
          try {
            let pcs = new IPcs({strPcs: pcsString})
            if (pcs.cardinal > 0) {
              this.checkoutForm.reset();
              // console.log("this route = ",  this.router.url)
              if (this.router.url === '/w-board') {
                 this.managerPageWBService.addPcs({somePcs:[pcs]})
              } else {
                this.managerPagePcsService.replaceBy(pcs)
                this.router.navigateByUrl('/pcs');
              }
            }
          } catch (e: any) {
          }
        }
      }
    }
  }

  /**
   * Search PCS having intervallic vector from cyclic group
   * Ex : 0,0,4,0,0,2 => PCS : { 0, 3, 7 }, { 0, 4, 7 }
   * If is found, push result on pcs or white board page.
   * @param searchIV intervallic vector
   * @private
   */
  private searchPcsWithThisIV(searchIV: string) {
    const pcsWithSameIV: IPcs[] = PcsSearch.searchPcsWithThisIV(searchIV)
    // console.log("pcsWithSameIV : " + pcsWithSameIV)
    if (pcsWithSameIV.length > 0) {
      if (this.router.url == '/w-board') {
        this.managerPageWBService.addPcs({somePcs:pcsWithSameIV})
      } else {
        // select the first of list as current pcs
        this.managerPagePcsService.replaceBy(pcsWithSameIV[0])
        // push all pcs having same IV into list pcs of pcs page
        for (const pcs of pcsWithSameIV) {
          this.managerPagePcsListService.addPcs('iv:' + searchIV, pcs)
        }
        this.router.navigateByUrl('/pcs');
      }
    }
  }

  /**
   * Search PCS having intervallic structure from cyclic group
   * Ex : 3,3,3,3 => PCS : { 0, 3, 6, 9 }
   * If is found, push result on pcs or white board page
   * @param searchIS intervallic structure
   * @private
   */
  private searchPcsWithThisIS(searchIS: string) {
    const pcs = PcsSearch.searchPcsWithThisIS(searchIS)
    if (pcs) {
      if (this.router.url == '/w-board') {
        this.managerPageWBService.addPcs({somePcs:[pcs]})
      } else {
        // select the first of list as current pcs
        this.managerPagePcsService.replaceBy(pcs)
        this.router.navigateByUrl('/pcs');
      }
    }
  }

  private searchPcsWithThisPid(pid: string) {
    const integerPid = parseInt(pid)
    if (!isNaN(integerPid)) {
      const pcs = PcsSearch.searchPcsWithThisPid(integerPid)
      if (pcs) {
        if (this.router.url == '/w-board') {
          this.managerPageWBService.addPcs({somePcs:[pcs]})
        } else {
          // select the first of list as current pcs
          this.managerPagePcsService.replaceBy(pcs)
          this.router.navigateByUrl('/pcs');
        }
      }
    }
  }
}
