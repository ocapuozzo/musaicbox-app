import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ISortedOrbits} from "../../core/ISortedOrbits";
import {NgIf, NgStyle} from "@angular/common";
import {MusaicComponent} from "../musaic/musaic.component";
import {ClockComponent} from "../clock/clock.component";
import {IPcs} from "../../core/IPcs";
import {ManagerHomePcsService} from "../../service/manager-home-pcs.service";
import {Router} from "@angular/router";
import {ManagerExplorerService} from "../../service/manager-explorer.service";

@Component({
  selector: 'app-orbit',
  standalone: true,
  imports: [
    NgIf,
    MusaicComponent,
    ClockComponent,
    NgStyle,
  ],
  templateUrl: './ui-orbit.component.html',
  styleUrl: './ui-orbit.component.css'
})
export class UiOrbitComponent {

  @Input() orbitsGroup: ISortedOrbits | null = null

  viewMusaic: boolean = false
  textButtonViewMusaicClock : string = "View Musaic"
  pcColorSet : string = 'black'
  pivotColor: string = 'black';

  ngOnInit() {
  }

  constructor(private readonly  managerHomePcsService : ManagerHomePcsService,
              private readonly managerExplorerService : ManagerExplorerService,
              private readonly router: Router) {}

  //
  // detectRightMouseClick($event: any, pcs:IPcs) {
  //   if ($event.which === 3) {
  //     this.contextMenuStyle = {
  //       'display' : 'block',
  //       'position' : 'absolute',
  //       'left.x' : $event.offsetX,
  //       'left.y' : $event.offsetY
  //     }
  //     this.currentPcs = pcs
  //   }
  // }

  changeViewIPcs() {
    this.viewMusaic = !this.viewMusaic;
    this.textButtonViewMusaicClock = this.viewMusaic  ?  "View Clock" : "View Musaic"
  }

  doPushToHomePage(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
    this.managerExplorerService.doSaveConfig()
    this.router.navigateByUrl('/home');
  }

}
