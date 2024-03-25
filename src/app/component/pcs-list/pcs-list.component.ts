import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ClockComponent} from "../clock/clock.component";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {MusicNotationComponent} from "../music-notation/music-notation.component";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";

@Component({
  selector: 'app-pcs-list',
  standalone: true,
  imports: [
    ClockComponent,
    MusicNotationComponent
  ],
  templateUrl: './pcs-list.component.html',
  styleUrl: './pcs-list.component.css'
})
export class PcsListComponent {

  labeledListPcs : Map<string, IPcs[]> = new Map<string, IPcs[]>()

  @Input() withMusicalNotation: boolean = true;

  constructor(
    private managerHomePcsListService : ManagerPagePcsListService,
    private managerHomePcsService : ManagerPagePcsService) {
    this.labeledListPcs = this.managerHomePcsListService.labeledListPcs
    this.managerHomePcsListService.updatePcsListEvent.subscribe( (labeledListPcs : Map<string, IPcs[]>) => {
      this.labeledListPcs = labeledListPcs
    })
  }

  doRemoveFromList(pcs: IPcs) {
    // console.log("doRemoveFromList :" + pcs.toString())
    this.managerHomePcsListService.removePcs(pcs)
  }

  doClearList() {
    this.managerHomePcsListService.clearList()
  }

  doSelectFromList(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
  }
}
