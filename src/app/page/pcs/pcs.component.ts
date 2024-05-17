import {Component, HostListener} from '@angular/core';

import {UiClockComponent} from "../../component/ui-clock/ui-clock.component";
import {UiMusaicComponent} from "../../component/ui-musaic/ui-musaic.component";
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {PcsAnalysisComponent} from "../../component/pcs-analysis/pcs-analysis.component";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {EightyEight} from "../../utils/EightyEight";
import {Router} from "@angular/router";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {IElementListPcs} from "../../service/IElementListPcs";
import {PcsListComponent} from "../../component/pcs-list/pcs-list.component";
import {NgClass} from "@angular/common";


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
    NgClass
  ],
  templateUrl: './pcs.component.html',
  styleUrl: './pcs.component.css'
})

export class PcsComponent {

  pcs: IPcs = new IPcs({strPcs:"0,1,2,3"})
  labeledListPcs = new Map<string, IElementListPcs>()
  protected readonly EightyEight = EightyEight;

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
    private readonly router: Router) {
    this.pcs = this.managerPagePcsService.pcs
    this.labeledListPcs = this.managerPagePcsListService.labeledListPcs

    this.managerPagePcsService.updatePcsEvent.subscribe( (pcs: IPcs) => {
      // same pcs as previous current ?
      // certainly with other iPivot (rem iPivot  is "transient", id is not based on iPivot)
      const prevCurrentPcs = this.managerPagePcsService.getPrevCurrentPcs()
      if (prevCurrentPcs && pcs.equalsPcs(prevCurrentPcs) && pcs.iPivot !== prevCurrentPcs.iPivot) {
      // if (pcs.equalsPcs(this.managerPagePcsService.getPrevCurrentPcs())) {
        // no change iPivot
        this.pcs = pcs
      } else {
        // new pcs, try well set iPivot
        this.pcs = this.trySetPivotFromSymmetry(pcs)
      }
    })

    this.managerPagePcsListService.updatePcsListEvent.subscribe( (labeledListPcs : Map<string, IElementListPcs>) => {
      this.labeledListPcs = labeledListPcs
    })


  }

  ngAfterViewInit() {
    // this.pcsList = this.managerPagePcsService.pcsList
  }

  gotoMusaic() {
    this.managerPagePcsService.replaceBy(EightyEight.getMusaic(this.pcs))
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

  /**
   * Try to define iPivot from symmetries of pcs
   * Rem : change transient state of his argument
   * @param newPcs
   * @private
   */
  private trySetPivotFromSymmetry(newPcs: IPcs): IPcs {
    if (newPcs.n !== 12) throw Error("pcs.n = " + newPcs.n + " invalid (must be 12 digits)")
    // experimental : select a pivot from axe symmetry
    let symmetries = newPcs.getAxialSymmetries()
    const firstIndexInter = symmetries.symInter.findIndex((value) => value === 1)
    const firstIndexMedian = symmetries.symMedian.findIndex((value) => value === 1)
    if (firstIndexMedian >= 0) {
      if (newPcs.abinPcs[firstIndexMedian] === 1) {
        newPcs.setPivot(firstIndexMedian)
      } else if (newPcs.abinPcs[(firstIndexMedian + 6) % newPcs.n] === 1) { // ok normally...
        newPcs.setPivot((firstIndexMedian + 6) % newPcs.n )
      }
    } else {
      if (firstIndexInter >= 0) {
        if (newPcs.abinPcs[firstIndexInter] === 1) {
          newPcs.setPivot(firstIndexInter)
        } else if (newPcs.abinPcs[(firstIndexInter + 6) % newPcs.n ] === 1)  {
            newPcs.setPivot((firstIndexInter + 6 ) % newPcs.n)
        }
      }
    }
    return newPcs
  }
}
