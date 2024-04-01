import { Component } from '@angular/core';
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {IPcs} from "../../core/IPcs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-page-the88',
  standalone: true,
  imports: [
    MusaicComponent
  ],
  templateUrl: './the88.component.html',
  styleUrl: './the88.component.css'
})
export class The88Component {
   group88 = GroupAction.predefinedGroupsActions(12,Group.MUSAIC)
   musaicDrawGrid: boolean = false

  constructor( private readonly managerHomePcsService : ManagerPagePcsService,
               private readonly router: Router) {
  }
  doPushToHomePage(pcs : IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
    this.router.navigateByUrl('/pcs');
  }
}
