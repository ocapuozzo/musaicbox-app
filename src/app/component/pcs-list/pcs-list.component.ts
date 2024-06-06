import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {ScoreNotationComponent} from "../score-notation/score-notation.component";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {IElementListPcs} from "../../service/IElementListPcs";
import {Clock2Component} from "../clock2/clock2.component";

@Component({
  selector: 'app-pcs-list',
  standalone: true,
  imports: [
    ScoreNotationComponent,
    Clock2Component
  ],
  templateUrl: './pcs-list.component.html',
  styleUrl: './pcs-list.component.css'
})
export class PcsListComponent {

  labeledListPcs = new Map<string, IElementListPcs>()

  @Input() withMusicalNotation: boolean = true;

  constructor(
    private managerHomePcsListService : ManagerPagePcsListService,
    private managerHomePcsService : ManagerPagePcsService) {
    this.labeledListPcs = this.managerHomePcsListService.labeledListPcs
    this.managerHomePcsListService.updatePcsListEvent
      .subscribe((labeledListPcs : Map<string, IElementListPcs>) => {
         this.labeledListPcs = labeledListPcs
    })
  }

  doRemoveFromList(pcs: IPcs) {
    // console.log("doRemoveFromList :" + pcsList.toString())
    this.managerHomePcsListService.removePcs(pcs)
  }

  doClearList() {
    this.managerHomePcsListService.clearList()
  }

  doPushPcsFromList(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
  }

}
