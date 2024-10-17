import {Component, OnInit} from '@angular/core';
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {IPcs} from "../../core/IPcs";
import {Router} from "@angular/router";
import {PcsColor} from "../../color/PcsColor";
import {MatDivider} from "@angular/material/divider";
import {MatButton} from "@angular/material/button";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf} from "@angular/common";
import {ManagerLocalStorageService} from "../../service/manager-local-storage.service";
import {EightyEight} from "../../utils/EightyEight";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {PcsComponent} from "../../component/pcs/pcs.component";
import {UIMusaic, UIPcsDto} from "../../ui/UIPcsDto";
import {CdkContextMenuTrigger, CdkMenu, CdkMenuItem} from "@angular/cdk/menu";
import {MatMenuContent} from "@angular/material/menu";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";
import {OctotropeComponent} from "../../component/octotrope/octotrope.component";
import {ArrayUtil} from "../../utils/ArrayUtil";
import {ManagerPageEightyHeightService} from "../../service/manager-page-eighty-height.service";


export interface IOrbitMusaic {
  pcsDto: UIPcsDto  // a representant of orbit (prime forme in modalPF)
  motifStabilizerNames: string[] // of orbit
  color: string
  cardinal: number
}

export interface IDdom {
  pcs: IPcs  // a representant of orbit (prime forme in modalPF)
  // motifStabilizerNames: string[] // of orbit
  cardinal: number
  active: boolean
  selected: boolean
}


@Component({
  selector: 'app-page-the88',
  standalone: true,
  imports: [
    MatDivider,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCheckbox,
    FormsModule,
    NgForOf,
    MusaicComponent,
    PcsComponent,
    CdkMenu,
    CdkMenuItem,
    MatMenuContent,
    MatSlideToggle,
    CdkContextMenuTrigger,
    OctotropeComponent,
    NgClass
  ],
  templateUrl: './the88.component.html',
  styleUrl: './the88.component.css'
})
export class The88Component implements OnInit {
  groupMusaic = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
  orbitsGroupedByMotifStab: IDdom[]

  musaicDrawGrid: boolean = false
  listOrbits: IOrbitMusaic[] = []
  nbMusaicsMatch = 0

  currentSelectedOps: string[] = ["M1"]

  pcs1: IPcs = new IPcs({strPcs: "0,3,4,5"});

  constructor(private readonly managerHomePcsService: ManagerPagePcsService,
              private readonly router: Router,
              private readonly managerLocalStorageService: ManagerLocalStorageService,
              private readonly managerPageWBService: ManagerPageWBService,
              private readonly managerPageEightyHeightService: ManagerPageEightyHeightService,
              ) {

    function makePcsDto(pcs: IPcs): UIPcsDto {
      let uiMus = new UIMusaic({
        rounded: true,
        width: 52,
        height: 52,
        widthCell: 5
      })
      return new UIPcsDto({
        pcs: pcs,
        uiMusaic: uiMus
      })
    }

    this.listOrbits = this.groupMusaic.orbits.map(orbit => (
      {
        pcsDto: makePcsDto(orbit.getPcsMin().modalPrimeForm()),
        motifStabilizerNames: orbit.motifStabilizer.name.split(' '),
        color: PcsColor.getColor(orbit.motifStabilizer.name),
        cardinal: orbit.cardinal
      }))

    this.pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).getIPcsInOrbit(this.pcs1)
    // console.log("this.pcs1", this.pcs1.stabilizer.motifStabilizer.motifStabOperations)

    // initialize 13 ddom data
    this.orbitsGroupedByMotifStab = this.groupMusaic.orbitsSortedGroupedByMotifStabilizers.map(orbit => ({
      pcs: orbit.orbits[0].getPcsMin(),
      cardinal: orbit.orbits.length,
      active: false,
      selected: false,
      date : new Date()
    }))
  }

  ngOnInit(): void {
    this.currentSelectedOps = this.managerLocalStorageService.restorePageThe88()
    this.updateOrbitsGroupedByMotifStab()
    this.managerPageEightyHeightService.eventSearchMatchMusaic.subscribe((somePcs: IPcs[]) => {
      this.searchMusaicThatMatches(somePcs)
    })
    // this.update88musicsWhenUserSelectOp()
  }

  doPushToPcsPage(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
    this.router.navigateByUrl('/pcs');
  }

  changeOp(op: string) {
    // console.log("event : " + op)
    let newCurrentSelectedOp = [...this.currentSelectedOps]
    const index = this.currentSelectedOps.indexOf(op);
    if (index > -1) {
      newCurrentSelectedOp.splice(index, 1);
    } else {
      newCurrentSelectedOp.push(op)
    }
    this.currentSelectedOps = EightyEight.sortToOrderedOperationsName(newCurrentSelectedOp);
    this.managerLocalStorageService.savePageThe88(this.currentSelectedOps)
    this.updateOrbitsGroupedByMotifStab()
    // this.update88musicsWhenUserSelectOp()
  }

  /**
   * 1/ update orbitsGroupedByMotifStab (ddoms) from this.currentSelectedOps (ops selected by user)
   * 2/ call update pcdDto of elements of this.listOrbits from orbitsGroupedByMotifStab selected (for update template)
   *
   * @private
   */
  private updateOrbitsGroupedByMotifStab() {
    // first step
    let newOrbitsGroupedByMotifStab = [...this.orbitsGroupedByMotifStab]
    for (let i = 0; i < this.orbitsGroupedByMotifStab.length; i++) {
      // if current selected operations are include into "ddom", select this group of orbits shearing same stabilizer
      if (ArrayUtil.isIncludeIn(
           this.currentSelectedOps,
           this.orbitsGroupedByMotifStab[i].pcs.stabilizer.motifStabilizer.motifStabOperations))
      {
        newOrbitsGroupedByMotifStab[i] = { ...this.orbitsGroupedByMotifStab[i], selected : true, active : true }
      } else if (this.orbitsGroupedByMotifStab[i].selected) {
        newOrbitsGroupedByMotifStab[i] = { ...this.orbitsGroupedByMotifStab[i], selected : false, active : false }
      }
    }
    this.orbitsGroupedByMotifStab = newOrbitsGroupedByMotifStab
    // second step
    this.update88musicsFromOrbitsGroupedByMotifStabSelectedAndActive()
  }

  update88musicsFromOrbitsGroupedByMotifStabSelectedAndActive() {
    let newMusaicOrbits: IOrbitMusaic[] = []
    let color: string = "black"
    this.nbMusaicsMatch = 0

    // loop over 88 musaics
    this.listOrbits.forEach(musaic => {
      color = "black"
      // search if current musaic match
      for (let i = 0; i < this.orbitsGroupedByMotifStab.length; i++) {
        if (this.orbitsGroupedByMotifStab[i].pcs.stabilizer.motifStabilizer.hashCode() === musaic.pcsDto.pcs.stabilizer.motifStabilizer.hashCode()
            && this.orbitsGroupedByMotifStab[i].selected
            && this.orbitsGroupedByMotifStab[i].active) {
          this.nbMusaicsMatch++
          color = PcsColor.getColor(this.currentSelectedOps.join(' '));
          break
        }
      }
      musaic.pcsDto.colorPitchOn = color
      newMusaicOrbits.push({...musaic, color: color})
    })
    // for auto update template
    this.listOrbits = newMusaicOrbits
  }

  isChecked(op: string) {
    return this.currentSelectedOps.includes(op)
  }

  doPushToWhiteboardPage(index: number) {
    this.managerPageWBService.setPcsDtoForTemplate(this.listOrbits[index].pcsDto)
    this.managerPageWBService.addPcs({somePcs: [this.listOrbits[index].pcsDto.pcs]})
    this.router.navigateByUrl('/w-board');
  }

  doPushSelectionToWhiteboardPage(color: string) {
    let selectedOrbits = this.listOrbits.filter(orbit => orbit.pcsDto.colorPitchOn === color)

    if (selectedOrbits.length > 0) {
      let template = new UIPcsDto({...selectedOrbits[0].pcsDto})
      if (selectedOrbits.length > 20) {
        template.uiMusaic = new UIMusaic({...template.uiMusaic, widthCell: 3, width: 26, height: 26})
      }
      this.managerPageWBService.setPcsDtoForTemplate(template)
      this.managerPageWBService.addPcs({somePcs: selectedOrbits.map(orbit => orbit.pcsDto.pcs), circularAlign: true})
      this.router.navigateByUrl('/w-board');
    }
  }

  cardinalWithThisColor(color: string) {
    return this.listOrbits.reduce((countSameColor, orbit) => orbit.pcsDto.colorPitchOn === color ? countSameColor + 1 : countSameColor, 0);
  }

  doSelectOrbitsHavingSameMotifStabilizerThan(index: number) {
    // toggle active ddom if ddom active > 1 (avoid empty selection)
    if (index > -1)  {
      if (this.orbitsGroupedByMotifStab.reduce((previousValue: number, currentValue) => currentValue.active ? previousValue = previousValue+1 : previousValue, 0) > 1
          || !this.orbitsGroupedByMotifStab[index].active
      )
      this.orbitsGroupedByMotifStab[index]= { ...this.orbitsGroupedByMotifStab[index], active:!this.orbitsGroupedByMotifStab[index].active }
      this.update88musicsFromOrbitsGroupedByMotifStabSelectedAndActive()
    }
  }

  pcsMatchOperationStabilizersSelected(pcsRepresentative: IPcs): boolean {
    const motifStabilizerOps = pcsRepresentative.stabilizer.motifStabilizer.motifStabOperations
    let match = true
    for (let i = 1; i < this.currentSelectedOps.length; i++) {
      const operation = this.currentSelectedOps[i]
      if (!motifStabilizerOps.includes(operation)) {
        match = false
      }
    }
    return match
  }

  private searchMusaicThatMatches(somePcs: IPcs[]) {
    let newMusaicOrbits: IOrbitMusaic[] = []
    let color: string = "black"
    this.nbMusaicsMatch = 0

    // loop over 88 musaics
    this.listOrbits.forEach(musaic => {
      color = "black"
      // search if current musaic match one pcs of somePcs
      for (let i = 0; i < somePcs.length; i++) {
        const pcs = somePcs[i]
        if (musaic.pcsDto.pcs.orbit.getPcsWithThisPid(pcs.pid()) !== undefined) {
          this.nbMusaicsMatch++
          color = 'blue'
          break
        }
      }
      musaic.pcsDto.colorPitchOn = color
      newMusaicOrbits.push({...musaic, color: color})
    })
    // for auto update template
    this.listOrbits = newMusaicOrbits
  }

  protected readonly console = console;
  protected readonly EightyEight = EightyEight;

}
