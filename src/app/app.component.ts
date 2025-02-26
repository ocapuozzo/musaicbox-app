import {Component, CUSTOM_ELEMENTS_SCHEMA, HostListener} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatDrawerMode, MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {BooleanInput} from '@angular/cdk/coercion';
import {BreakpointObserver} from '@angular/cdk/layout';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faGuitar} from '@fortawesome/free-solid-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IPcs} from "./core/IPcs";
import {ManagerPagePcsService} from "./service/manager-page-pcs.service";
import {ManagerPagePcsListService} from "./service/manager-page-pcs-list.service";
import {MatTooltip} from "@angular/material/tooltip";
import {PcsSearch} from "./utils/PcsSearch";
import {ManagerPageWBService} from "./service/manager-page-wb.service";
import {ManagerPageEightyHeightService} from "./service/manager-page-eighty-height.service";
import {NgOptimizedImage} from "@angular/common";
import {PcsUtils} from "./utils/PcsUtils";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, FontAwesomeModule,
    FormsModule, ReactiveFormsModule, MatTooltip, NgOptimizedImage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MusaicApp';
  mdcBackdrop: BooleanInput = false;
  drawerMode: MatDrawerMode = "push";
  faGuitar = faGuitar
  faGithub = faGithub

  p4GuitarPageActivate: boolean = false
  shiftKey: boolean = false

  private lastDoubleClickTime: number = Date.now()

  readonly breakpoint$ = this.breakpointObserver
    .observe(['(max-width: 500px)']);

  checkoutForm = this.formBuilder.group({
    pcsStr: ''
  });


  constructor(private formBuilder: FormBuilder,
              private readonly managerPagePcsService: ManagerPagePcsService,
              private readonly managerPagePcsListService: ManagerPagePcsListService,
              private readonly managerPageWBService: ManagerPageWBService,
              private readonly managerPageEightyHeightService: ManagerPageEightyHeightService,
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
    if (event.altKey && (event.shiftKey || event.metaKey)) {
      // console.log("event key = ", event)
      switch (event.key) {
        case "G" :
          this.p4GuitarPageActivate = !this.p4GuitarPageActivate
          break
      }
    } else if (event.shiftKey) {

    }
  }

  @HostListener('window:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
     this.shiftKey = event.shiftKey
  }


  /**
   *
   */
  onSubmitSearchForm(): void {
    // console.log('pscStr = ', this.checkoutForm.value.pcsStr?.trim());
    if (this.checkoutForm.value.pcsStr) {

      let pcsString = this.checkoutForm.value.pcsStr.trim() ?? ''
      // accept separators : comma space underscore

      pcsString = pcsString.replace(/\s\s+/g, ',')
      // replace sep _ or space by comma
      pcsString = pcsString.replace(/[ _]/g, ",").trim();
      // replace double comma by single comma
      pcsString = pcsString.replace(/,,/g, ",").trim();

      if (pcsString) {
        if (pcsString.startsWith('iv:')) {
          this.searchPcsWithThisIV(PcsUtils.pcsStringToStringSpaced(pcsString.substring(3), ','), pcsString)
          // this.searchPcsWithThisIV(pcsString.substring(3), pcsString)
        } else if (pcsString.startsWith('is:')) {
          this.searchPcsWithThisIS(PcsUtils.pcsStringToStringSpaced(pcsString.substring(3), ','), pcsString)
        } else if (pcsString.startsWith('pid:')) {
          this.searchPcsWithThisPid(pcsString.substring(4), pcsString)
        } else {
          // search pcs
          try {
            // pcsString = PcsUtils.pcsStringToStringSpaced(pcsString)
            let pcs = new IPcs({strPcs: pcsString})
            //console.log(" pcs = ", pcs)
            if (pcs.cardinal > 0) {
              // this.checkoutForm.reset();
              this.gotoCurrentPage(pcs, pcsString)
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
   * @param inputSearch original user input search
   * @private
   */
  private searchPcsWithThisIV(searchIV: string, inputSearch : string) {
    const pcsWithSameIV: IPcs[] = PcsSearch.searchPcsWithThisIV(searchIV)
    // console.log("pcsWithSameIV : " + pcsWithSameIV)
    if (pcsWithSameIV.length > 0) {
      switch (this.router.url) {
        case '/w-board' :
          this.managerPageWBService.addPcs({somePcs: pcsWithSameIV})
          break
        case '/the88' :
          this.managerPageEightyHeightService.searchMusaic({ somePcs:pcsWithSameIV, searchInput:inputSearch })
          break;
        default : // PCS page
          // select the first of list as current pcs
          this.managerPagePcsService.replaceBy(pcsWithSameIV[0])
          // push all pcs having same IV into list pcs of pcs page
          this.managerPagePcsListService.clearLists()
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
   * @param searchInput original user input search
   * @private
   */
  private searchPcsWithThisIS(searchIS: string, searchInput : string) {
    const pcs = PcsSearch.searchPcsWithThisIS(searchIS)
    if (pcs) {
      this.gotoCurrentPage(pcs, searchInput)
    }
  }

  private searchPcsWithThisPid(pid: string, searchInput : string) {
    const integerPid = parseInt(pid)
    if (!isNaN(integerPid)) {
      const pcs = PcsSearch.searchPcsWithThisPid(integerPid)
      if (pcs) {
        this.gotoCurrentPage(pcs, searchInput)
      }
    }
  }

  private gotoCurrentPage(pcs: IPcs, searchInput : string) {
    // console.log("this route = ", this.router.url)
    switch (this.router.url) {
      case '/w-board' :
        this.managerPageWBService.addPcs({somePcs: [pcs]})
        break
      case '/the88' :
        this.managerPageEightyHeightService.searchMusaic({searchInput:searchInput ?? '', somePcs:[pcs]})
        break;
      default :
        this.managerPagePcsService.replaceBy(pcs)
        this.router.navigateByUrl('/pcs');
    }
  }

  onActivate($event: any) {
     window.scroll({
       top:0,
       left:0,
       behavior:'smooth'
     })
  }

  ctrlKey() {

  }

  /**
   * When called, do two things :
   * - store time of call in this.lastDoubleClickTime, for next use
   * - return true is time of call is in ]lastDoubleClickTime+delay/2...lastDoubleClickTime+delay[, false else
   */
  doubleClick(delay = 500) : boolean {
    const now = Date.now()
    const delta = delay/2
    let lastDoubleClick = this.lastDoubleClickTime
    this.lastDoubleClickTime = now

    return now > lastDoubleClick+delta && now < lastDoubleClick+delay
  }

  /**
   * Use for limited access to analyse/documentation when it is in progress...
   * Only users (or almost) will have access to the docs in progress
   *
   * @param url
   */
  goToLink(url: string) {
    if (this.doubleClick(1000)) {
      // match if is a "long" double click
      window.open(url, "_blank");
    }
  }
}
