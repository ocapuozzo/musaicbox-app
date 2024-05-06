import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ISortedOrbits} from "../../core/ISortedOrbits";
import {NgIf, NgStyle} from "@angular/common";
import {MusaicComponent} from "../musaic/musaic.component";
import {ClockComponent} from "../clock/clock.component";
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {Router} from "@angular/router";
import {ManagerExplorerService} from "../../service/manager-explorer.service";
import {EightyEight} from "../../utils/EightyEight";
import {MatTooltip} from "@angular/material/tooltip";
import {PcsColor} from "../../color/PcsColor";
import {Orbit} from "../../core/Orbit";

@Component({
  selector: 'app-orbit',
  standalone: true,
  imports: [
    NgIf,
    MusaicComponent,
    ClockComponent,
    NgStyle,
    MatTooltip,
  ],
  templateUrl: './ui-orbit.component.html',
  styleUrl: './ui-orbit.component.css'
})
export class UiOrbitComponent {

  @Input() orbitsGroup: ISortedOrbits | null = null

  viewMusaic: boolean = false
  textButtonViewMusaicClock : string = "View Musaic"
  pcColorSet : string = 'black'

  ngOnInit() {
  }

  constructor(private readonly  managerPagePcsService : ManagerPagePcsService,
              private readonly managerExplorerService : ManagerExplorerService,
              private readonly router: Router) {}

  changeViewIPcs() {
    this.viewMusaic = !this.viewMusaic;
    this.textButtonViewMusaicClock = this.viewMusaic  ?  "View Clock" : "View Musaic"
  }

  doPushToPcsPage(pcs: IPcs) {
    this.managerPagePcsService.replaceBy(pcs)
    this.managerExplorerService.doSaveConfig()
    this.router.navigateByUrl('/pcs');
  }

  protected readonly EightyEight = EightyEight;
  protected readonly PcsColor = PcsColor;
  protected readonly parseInt = parseInt;
  protected readonly Math = Math;

  colorOrbit(orbit: Orbit): string {
    // if (orbit!.groupAction!.cardinal == orbit.cardinal) {
    //   // no stabilizer
    //   return 'black'
    // }
    return PcsColor.getColor(orbit.motifStabilizer.name);
  }
}
