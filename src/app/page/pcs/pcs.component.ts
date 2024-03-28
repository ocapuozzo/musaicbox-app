import {Component, HostListener} from '@angular/core';

import {UiClockComponent} from "../../component/ui-clock/ui-clock.component";
import {UiMusaicComponent} from "../../component/ui-musaic/ui-musaic.component";
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {PcsAnalysisComponent} from "../../component/pcs-analysis/pcs-analysis.component";
import {PcsListComponent} from "../../component/pcs-list/pcs-list.component";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {EightyEight} from "../../utils/EightyEight";
import {Router} from "@angular/router";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-pcs',
  standalone: true,
  imports: [
    UiClockComponent,
    UiMusaicComponent,
    PcsAnalysisComponent,
    PcsListComponent,
    MatButton
  ],
  templateUrl: './pcs.component.html',
  styleUrl: './pcs.component.css'
})

export class PcsComponent {

  pcs: IPcs = new IPcs({strPcs:"0,1,2,3"})
  labeledListPcs : Map<string, IPcs[]> = new Map<string, IPcs[]>()
  protected readonly EightyEight = EightyEight;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if((event.ctrlKey || event.metaKey) && event.key == "z") {
      // console.log('CTRL + Z');
      this.managerHomePcsService.unDoPcs()
    }
    if((event.ctrlKey || event.metaKey) && event.key == "y") {
      // console.log('CTRL + Y');
      this.managerHomePcsService.reDoPcs()
    }
  }

  constructor(
    private readonly managerHomePcsService : ManagerPagePcsService,
    private readonly managerHomePcsListService : ManagerPagePcsListService,
    private readonly router: Router) {
    this.pcs = this.managerHomePcsService.pcs
    this.labeledListPcs = this.managerHomePcsListService.labeledListPcs

    this.managerHomePcsService.updatePcsEvent.subscribe( (pcs: IPcs) => {
      this.pcs = pcs
    })

    this.managerHomePcsListService.updatePcsListEvent.subscribe( (labeledListPcs : Map<string, IPcs[]>) => {
      this.labeledListPcs = labeledListPcs
    })


  }

  ngAfterViewInit() {
    // this.pcs = this.managerHomePcsService.pcs
  }

  gotoMusaic() {
    this.managerHomePcsService.replaceBy(EightyEight.getMusaic(this.pcs))
  }
}
