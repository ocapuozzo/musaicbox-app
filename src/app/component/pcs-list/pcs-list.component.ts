import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ClockComponent} from "../clock/clock.component";
import {ManagerHomePcsListService} from "../../service/manager-home-pcs-list.service";
import {MusicNotationComponent} from "../music-notation/music-notation.component";

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

  constructor(private managerHomePcsListService : ManagerHomePcsListService) {
    this.labeledListPcs = this.managerHomePcsListService.labeledListPcs
    this.managerHomePcsListService.updatePcsList.subscribe( (labeledListPcs : Map<string, IPcs[]>) => {
      this.labeledListPcs = labeledListPcs
    })
  }

  doRemoveFromList(pcs: IPcs) {
    this.managerHomePcsListService.removePcs(pcs)
  }

  doClearList() {
    this.managerHomePcsListService.clearList()
  }
}
