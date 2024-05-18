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
    private readonly managerPagePcsListService : ManagerPagePcsListService) {

    this.pcs = this.managerPagePcsService.pcs
    this.labeledListPcs = this.managerPagePcsListService.labeledListPcs

    this.managerPagePcsService.updatePcsEvent.subscribe( (pcs: IPcs) => {
        this.pcs = pcs
    })

    this.managerPagePcsListService.updatePcsListEvent.subscribe( (labeledListPcs : Map<string, IElementListPcs>) => {
      this.labeledListPcs = labeledListPcs
    })
  }

  ngOnInit() {
    // this.pcs = this.managerPagePcsService.pcs
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
}
