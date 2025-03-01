import {Component, HostListener} from '@angular/core';

import {UiClockComponent} from "../../component/ui-clock/ui-clock.component";
import {UiMusaicComponent} from "../../component/ui-musaic/ui-musaic.component";
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {PcsAnalysisComponent} from "../../component/pcs-analysis/pcs-analysis.component";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {EightyEight} from "../../utils/EightyEight";
import {ActivatedRoute, Router} from "@angular/router";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {IElementListPcs} from "../../service/IElementListPcs";
import {PcsListComponent} from "../../component/pcs-list/pcs-list.component";
import {NgClass, NgStyle} from "@angular/common";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Subject, takeUntil} from "rxjs";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";
import {PcsSearch} from "../../utils/PcsSearch";
import {HtmlUtil} from "../../utils/HtmlUtil";


@Component({
  selector: 'app-page-pcs',
  standalone: true,
  imports: [
    UiClockComponent,
    UiMusaicComponent,
    PcsAnalysisComponent,
    MatButton,
    MatIcon,
    PcsListComponent,
    NgClass,
    NgStyle
  ],
  templateUrl: './pcs-page.component.html',
  styleUrl: './pcs-page.component.css'
})

export class PcsPageComponent {

  pcs: IPcs = new IPcs({strPcs:"0,1,2,3"})
  labeledListPcs = new Map<string, IElementListPcs>()
  protected readonly EightyEight = EightyEight;

  maxWidthParentUiMusaic: string = "270px";
  maxWidthUiMusaic: string = "250px"

  destroyed = new Subject<void>();
  currentScreenSize: string;
  // Create a map to display breakpoint names for demonstration purposes.
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);


  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if((event.ctrlKey || event.metaKey) && event.key == "z") {
      // console.log('CTRL + Z');
      this.doUnDo()
    }
    if((event.ctrlKey || event.metaKey) && event.key == "y") {
      // console.log('CTRL + Y');
      this.doReDo()
    }
  }

  constructor(
    private readonly managerPagePcsService : ManagerPagePcsService,
    private readonly managerPagePcsListService : ManagerPagePcsListService,
    private managerPageWBService : ManagerPageWBService,
    private router : Router,
    private activateRoute: ActivatedRoute,
    private responsive: BreakpointObserver) {

    this.pcs = this.managerPagePcsService.pcs
    this.labeledListPcs = this.managerPagePcsListService.labeledListPcs

    this.managerPagePcsService.updatePcsEvent.subscribe( (pcs: IPcs) => {
      const isNew = this.pcs.id !== pcs.id
      this.pcs = pcs
      // avoid refresh not desired on smartphone...
      if (isNew) {
          HtmlUtil.gotoTopPage()
      }
    })

    this.managerPagePcsListService.updatePcsListEvent.subscribe( (labeledListPcs : Map<string, IElementListPcs>) => {
      this.labeledListPcs = labeledListPcs
    })
  }

  ngOnInit() {
    // from https://material.angular.io/cdk/layout/overview
    this.responsive
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.currentScreenSize = this.displayNameMap.get(query) ?? 'Unknown';
            switch (this.currentScreenSize) {
              case "Small":
              case "XSmall" :
                this.maxWidthParentUiMusaic = "165px"
                this.maxWidthUiMusaic = "165px"
                break
              case "Medium":
                this.maxWidthParentUiMusaic = "210px"
                this.maxWidthUiMusaic = "200px"
                break
              default : // large
                this.maxWidthParentUiMusaic = "270px"
                this.maxWidthUiMusaic = "250px"
            }
            this.managerPagePcsService.refresh()
            break
          }
        }
        // console.log("this.currentScreenSize : " + this.currentScreenSize )
      });

    // route pcs/pid/42 => pcs {1,3,5}, musaic n° 11
    this.activateRoute.params.subscribe(params => {
      const pid =  parseInt(this.activateRoute.snapshot.paramMap.get('pid') || '');
      // console.log(`pid : ${pid}`)
      if (! isNaN(pid)) {
        const pcs = PcsSearch.searchPcsWithThisPid(pid)
        if (pcs) {
          // console.log(`pcs : ${pcs}`)
          this.managerPagePcsService.replaceBy(pcs)
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  changeByMusaic() {
    this.managerPagePcsService.replaceBy(EightyEight.getMusaic(this.pcs).symmetryPrimeForm())
  }

  doUnDo() {
    this.managerPagePcsService.unDoPcs()
  }

  doReDo() {
    this.managerPagePcsService.reDoPcs()
  }

  get canUndo() : boolean {
    return this.managerPagePcsService.canUndo()
  }

  get canRedo() : boolean {
    return this.managerPagePcsService.canRedo()
  }

  isForUpdatePcsDto() : boolean {
    return this.managerPagePcsService.indexPcsForEdit >= 0
  }

  updateToWhiteBoardPage() {
    if (this.managerPagePcsService.indexPcsForEdit >= 0) {
      this.managerPageWBService.updatePcsDto(this.managerPagePcsService.indexPcsForEdit, this.pcs)
      this.managerPagePcsService.indexPcsForEdit = -1
      this.router.navigateByUrl('/w-board');
    }
  }

  pushToWhiteBoardPage() {
    this.managerPagePcsService.indexPcsForEdit = -1
    this.managerPageWBService.addPcs({somePcs:[this.pcs]})
    this.router.navigateByUrl('/w-board');
  }


}
