import {Component, Input} from '@angular/core';
import {ISortedOrbits} from "../../core/ISortedOrbits";
import {NgIf} from "@angular/common";
import {MusaicComponent} from "../musaic/musaic.component";
import {ClockComponent} from "../clock/clock.component";

@Component({
  selector: 'app-orbit',
  standalone: true,
  imports: [
    NgIf,
    MusaicComponent,
    ClockComponent
  ],
  templateUrl: './ui-orbit.component.html',
  styleUrl: './ui-orbit.component.css'
})
export class UiOrbitComponent {

  @Input() orbitsGroup: ISortedOrbits | null = null

  viewClock: boolean = false
  textButtonViewMusaicClock : string = "View Musaic"
  pcColorSet : string = 'black'
  pivotColor: string = 'black';

  changeViewIPcs() {
    this.viewClock = !this.viewClock;
    this.textButtonViewMusaicClock = this.viewClock  ? "View Musaic" : "View Clock"
  }

}
