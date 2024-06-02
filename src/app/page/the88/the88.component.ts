import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {IPcs} from "../../core/IPcs";
import {Router} from "@angular/router";
import {PcsColor} from "../../color/PcsColor";
import {Orbit} from "../../core/Orbit";
import {MatDivider} from "@angular/material/divider";
import {MatButton} from "@angular/material/button";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule} from "@angular/forms";
import {MusaicPcsOperation} from "../../core/MusaicPcsOperation";
import {NgForOf} from "@angular/common";
import {ManagerLocalStorageService} from "../../service/manager-local-storage.service";

export interface IOrbitMusaic {
  pcs : IPcs  // a representant of orbit (prime forme in modalPF)
  motifStabilizerName : string[] // of orbit
  color : string,
  cardinal: number
}

@Component({
  selector: 'app-page-the88',
  standalone: true,
  imports: [
    MusaicComponent,
    MatDivider,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCheckbox,
    FormsModule,
    NgForOf
  ],
  templateUrl: './the88.component.html',
  styleUrl: './the88.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class The88Component implements OnInit {
  group88 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
  musaicOrbits : IOrbitMusaic[] =
    this.group88.orbits.map(orbit => (
      {
        pcs:orbit.getPcsMin().modalPrimeForm(),
        motifStabilizerName:orbit.motifStabilizer.name.split(' '),
        color: PcsColor.getColor(orbit.motifStabilizer.name),
        cardinal:orbit.cardinal
      }))
  musaicDrawGrid: boolean = false
  protected readonly PcsColor = PcsColor;

  nbMusaicsMatch = 0

  currentSelectedOp : string[] = ["M1"]

  readonly orderedOperations = ["M1", "M5", "M7", "M11", "CM1", "CM5", "CM7", "CM11"]

  testColor = "red"

  colorOrbits: string[] = ["black", "yellow"]

  constructor(private readonly managerHomePcsService: ManagerPagePcsService,
              private readonly router: Router,
              private readonly managerLocalStorageService : ManagerLocalStorageService) {
  }

  ngOnInit(): void {
    this.currentSelectedOp = this.managerLocalStorageService.restorePageThe88()
    this.update88musics()
  }

  doPushToHomePage(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
    this.router.navigateByUrl('/pcs');
  }

  colorOrbit(orbit: Orbit): string  {
    if (this.currentSelectedOp.length === 0) {
      return PcsColor.getColor(orbit.motifStabilizer.name);
    } else {
      for (let i = 0; i < this.currentSelectedOp.length; i++) {
        const operation = this.currentSelectedOp[i]
        if (orbit.motifStabilizer.name.includes(operation)) {
          // TODO OR but must be AND
          return PcsColor.getColor(operation)
        }
      }
      return "black"
    }
  }

  changeOp(op: string) {
    // console.log("event : " + op)
    let newCurrentSelectedOp = [...this.currentSelectedOp]
    const index = this.currentSelectedOp.indexOf(op);
    if (index > -1) {
      newCurrentSelectedOp.splice(index, 1);
    } else {
      newCurrentSelectedOp.push(op)
    }
    let newCurrentSelectedOpOrdered: string[] = []
    for (let i = 0; i < this.orderedOperations.length; i++) {
      if (newCurrentSelectedOp.includes(this.orderedOperations[i])) {
        newCurrentSelectedOpOrdered.push(this.orderedOperations[i])
      }
    }
    this.currentSelectedOp = newCurrentSelectedOpOrdered
    this.managerLocalStorageService.savePageThe88(this.currentSelectedOp)
    this.update88musics()
  }

  private update88musics() {
    let newMusaicOrbits : IOrbitMusaic[] = []
    let color : string = "black"
    this.nbMusaicsMatch = 0
    this.musaicOrbits.forEach(musaic => {
      if (this.currentSelectedOp.length === 1) { // M1 only => show global partition stabilizer
        color = PcsColor.getColor(musaic.motifStabilizerName.join(' '))
      } else {
        color = "black"
        let allOpMatch = true
        // start to 1 (0 == M1)
        for (let i = 1; i < this.currentSelectedOp.length; i++) {
          const operation = this.currentSelectedOp[i]
          if (!musaic.motifStabilizerName.includes(operation)) {
            allOpMatch = false
          }
        }
        if (allOpMatch) {
          // console.log(this.currentSelectedOp.join(' ') => example : M1 M7 CM1
          this.nbMusaicsMatch++
          color = PcsColor.getColor(this.currentSelectedOp.join(' '));
        }
      }
      // https://medium.com/angular-in-depth/deep-dive-into-the-onpush-change-detection-strategy-in-angular-fab5e4da1d69
      newMusaicOrbits.push({...musaic, color: color})
    })

    console.log(newMusaicOrbits[2])
    // for auto update template
    this.musaicOrbits = newMusaicOrbits
  }

  isChecked(op: string) {
    return this.currentSelectedOp.includes(op)
  }
}
