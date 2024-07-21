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
import {NgForOf} from "@angular/common";
import {ManagerLocalStorageService} from "../../service/manager-local-storage.service";
import {EightyEight} from "../../utils/EightyEight";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {PcsComponent} from "../../component/pcs/pcs.component";
import {UIMusaic, UIPcsDto} from "../../ui/UIPcsDto";
import {CdkContextMenuTrigger, CdkMenu, CdkMenuItem} from "@angular/cdk/menu";
import {MatMenuContent} from "@angular/material/menu";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";

export interface IOrbitMusaic {
  pcs: IPcs  // a representant of orbit (prime forme in modalPF)
  motifStabilizerName: string[] // of orbit
  color: string,
  cardinal: number
}

export interface IOrbitMusaic2 {
  pcsDto: UIPcsDto  // a representant of orbit (prime forme in modalPF)
  motifStabilizerName: string[] // of orbit
  color: string
  cardinal: number
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
    CdkContextMenuTrigger
  ],
  templateUrl: './the88.component.html',
  styleUrl: './the88.component.css'
})
export class The88Component implements OnInit {
  group88 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)

  musaicDrawGrid: boolean = false
  listOrbits: IOrbitMusaic2[] = []
  nbMusaicsMatch = 0

  currentSelectedOp: string[] = ["M1"]

  constructor(private readonly managerHomePcsService: ManagerPagePcsService,
              private readonly router: Router,
              private readonly managerLocalStorageService: ManagerLocalStorageService,
              private readonly managerPageWBService: ManagerPageWBService) {

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

    this.listOrbits = this.group88.orbits.map(orbit => (
      {
        pcsDto: makePcsDto(orbit.getPcsMin().modalPrimeForm()),
        motifStabilizerName: orbit.motifStabilizer.name.split(' '),
        color: PcsColor.getColor(orbit.motifStabilizer.name),
        cardinal: orbit.cardinal
      }))
  }

  ngOnInit(): void {
    this.currentSelectedOp = this.managerLocalStorageService.restorePageThe88()
    this.update88musics()
  }

  doPushToPcsPage(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
    this.router.navigateByUrl('/pcs');
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
    this.currentSelectedOp = EightyEight.sortToOrderedOperationsName(newCurrentSelectedOp);
    this.managerLocalStorageService.savePageThe88(this.currentSelectedOp)
    this.update88musics()
  }

  private update88musics() {
    let newMusaicOrbits: IOrbitMusaic2[] = []
    let color: string = "black"
    this.nbMusaicsMatch = 0
    this.listOrbits.forEach(musaic => {
      if (this.currentSelectedOp.length === 1) { // M1 only => show global partition stabilizer
        color = PcsColor.getColor(musaic.motifStabilizerName.join(' '))
        musaic.pcsDto.colorPitchOn = color
      } else {
        color = "black"
        musaic.pcsDto.colorPitchOn = color
        let allOpMatch = true
        // start to 1 (0 == M1)
        for (let i = 1; i < this.currentSelectedOp.length; i++) {
          const operation = this.currentSelectedOp[i]
          if (!musaic.motifStabilizerName.includes(operation)) {
            allOpMatch = false
          }
        }
        if (allOpMatch) {
          // this musaic is invariant by all selected operations, so a color is given
          // console.log(this.currentSelectedOp.join(' ') => example : M1 M7 CM1
          this.nbMusaicsMatch++
          color = PcsColor.getColor(this.currentSelectedOp.join(' '));
          musaic.pcsDto.colorPitchOn = color
        }
      }
      // https://medium.com/angular-in-depth/deep-dive-into-the-onpush-change-detection-strategy-in-angular-fab5e4da1d69
      newMusaicOrbits.push({...musaic, color: color})
    })

    // for auto update template
    this.listOrbits = newMusaicOrbits
  }

  isChecked(op: string) {
    return this.currentSelectedOp.includes(op)
  }

  protected readonly EightyEight = EightyEight;

  doPushToWhiteboardPage(index: number) {
    this.managerPageWBService.setPcsDtoForTemplate(this.listOrbits[index].pcsDto)
    this.managerPageWBService.addPcs([this.listOrbits[index].pcsDto.pcs])
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
      this.managerPageWBService.addPcs(selectedOrbits.map(orbit => orbit.pcsDto.pcs), true)
      this.router.navigateByUrl('/w-board');
    }
  }

  cardinalWithThisColor(color: string) {
    return this.listOrbits.reduce((countSameColor, orbit) => orbit.pcsDto.colorPitchOn === color ? countSameColor + 1 : countSameColor, 0);
  }
}
