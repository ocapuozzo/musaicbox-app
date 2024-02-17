import { Component } from '@angular/core';

import {UiClockComponent} from "../../component/ui-clock/ui-clock.component";
import {UiMusaicComponent} from "../../component/ui-musaic/ui-musaic.component";
import {update} from "@angular-devkit/build-angular/src/tools/esbuild/angular/compilation/parallel-worker";
import {IPcs} from "../../core/IPcs";
import {ManagerHomePcsService} from "../../service/manager-home-pcs.service";
import {PcsAnalysisComponent} from "../../component/pcs-analysis/pcs-analysis.component";
import {PcsListComponent} from "../../component/pcs-list/pcs-list.component";
import {ManagerHomePcsListService} from "../../service/manager-home-pcs-list.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    UiClockComponent,
    UiMusaicComponent,
    PcsAnalysisComponent,
    PcsListComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  pcs: IPcs = new IPcs({strPcs:"0,1,2,3"})
  pcsList : IPcs[] = []

  constructor(
    private managerHomePcsService : ManagerHomePcsService,
    private managerHomePcsListService : ManagerHomePcsListService) {
    this.pcs = this.managerHomePcsService.pcs
    this.pcsList = this.managerHomePcsListService.pcsList

    this.managerHomePcsService.updatePcs.subscribe( (pcs: IPcs) => {
      this.pcs = pcs
    })
    this.managerHomePcsListService.updatePcsList.subscribe( (pcsList: IPcs[]) => {
      this.pcsList = pcsList
    })
  }

  ngAfterViewInit() {
    // this.pcs = this.managerHomePcsService.pcs
  }

}
