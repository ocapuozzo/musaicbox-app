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

  pcsList : IPcs[] = []
  @Input() withMusicalNotation: boolean = true;

  constructor(private managerHomePcsListService : ManagerHomePcsListService) {
    this.pcsList = this.managerHomePcsListService.pcsList
    this.managerHomePcsListService.updatePcsList.subscribe( (pcsList: IPcs[]) => {
      this.pcsList = pcsList
    })
  }

  doRemoveFromList(pcs: IPcs) {
    this.managerHomePcsListService.removePcs(pcs)
  }
}
