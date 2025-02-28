import {Component, OnInit, ViewChild} from '@angular/core';
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {IPcs} from "../../core/IPcs";
import {Router} from "@angular/router";
import {PcsColor} from "../../color/PcsColor";
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgTemplateOutlet} from "@angular/common";
import {ManagerLocalStorageService} from "../../service/manager-local-storage.service";
import {EightyEight} from "../../utils/EightyEight";
import {PcsComponent} from "../../component/pcs/pcs.component";
import {UIMusaic, UIPcsDto} from "../../ui/UIPcsDto";
import {CdkContextMenuTrigger, CdkMenu, CdkMenuItem} from "@angular/cdk/menu";
import {MatMenuContent} from "@angular/material/menu";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";
import {OctotropeComponent} from "../../component/octotrope/octotrope.component";
import {ArrayUtil} from "../../utils/ArrayUtil";
import {ISearchPcs, ManagerPageEightyHeightService} from "../../service/manager-page-eighty-height.service";
import {MatTab, MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {Orbit} from "../../core/Orbit";
import {ManagerGroupActionService} from "../../service/manager-group-action.service";


export interface IOrbitMusaic {
  pcsDto: UIPcsDto  // a representative of orbit (prime forme in modalPF)
  metaStabilizerNames: string[] // of orbit
  color: string
  cardinal: number
}

export interface IOctotrope {
  pcs: IPcs  // a representative of orbit (prime forme in modalPF ?)
  numberOfMusaics: number
  numberOfCyclicOrbits: number
  numberOfPcs: number
  active: boolean
  selected: boolean
}


@Component({
  selector: 'app-page-the88',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    PcsComponent,
    CdkMenu,
    CdkMenuItem,
    MatMenuContent,
    CdkContextMenuTrigger,
    OctotropeComponent,
    NgClass,
    MatTabGroup,
    MatTab,
    NgTemplateOutlet
  ],
  templateUrl: './the88.component.html',
  styleUrl: './the88.component.css'
})
export class The88Component implements OnInit {
  @ViewChild("matTabGroup", {static: false}) matTabGroup: MatTabGroup;
  groupMusaic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
  octotropes: IOctotrope[]

  musaicDrawGrid: boolean = false
  listOrbits: IOrbitMusaic[] = []
  nbMusaicsMatch = 0

  currentSelectedOps: string[] = ["M1"]
  searchPcsInput: ISearchPcs = {somePcs: [], searchInput: ''}

  private indexSelectedOctotrope: number;

  pcs: IPcs = new IPcs({strPcs: "0,3,4,5"}); // updated into constructor


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
        pcsDto: makePcsDto(orbit.getPcsMin().symPrimeForm()),
        metaStabilizerNames: orbit.metaStabilizer.name.split(' '),
        color: PcsColor.getColor(orbit.metaStabilizer.name),
        cardinal: orbit.cardinal
      }))

    this.pcs = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!.getIPcsInOrbit(this.pcs)
    // console.log("this.pcs", this.pcs.stabilizer.strMetaStabilizer.metaStabOperations)

    // initialize 13 octotropes data
    this.octotropes = this.groupMusaic.orbitsSortedGroupedByMetaStabilizer.map(orbit => ({
      pcs: orbit.orbits[0].getPcsMin(), // get any pcs in any orbit... min by default
      numberOfMusaics: orbit.orbits.length,
      numberOfPcs: orbit.orbits.reduce((numberPcs, orbit) =>
        numberPcs + orbit.cardinal, 0),
      numberOfCyclicOrbits: this.getNumberCyclicPF(orbit.orbits),
      active: false,
      selected: false,
      date: new Date()
    }))
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.managerPageEightyHeightService.eventSearchMatchMusaic.subscribe((searchData: ISearchPcs) => {
      this.searchPcsInput = searchData
      this.searchMusaicThatMatches(searchData)
      this.matTabGroup.selectedIndex = 2
    })
    // https://stackoverflow.com/questions/71978152/how-can-i-fix-this-specific-ng0100-expressionchangedafterithasbeencheckederror
    setTimeout(() => {
      const dataRestore = this.managerLocalStorageService.restorePageThe88()
      this.currentSelectedOps = [...dataRestore.selectedOps]
      this.matTabGroup.selectedIndex = dataRestore.indexTab
      this.indexSelectedOctotrope = dataRestore.indexSelectedOctotrope
      this.updateOctotropes()
    })
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
    this.saveConfigurationPage()
    this.updateOctotropes()
  }

  /**
   * updateOrbitsGroupedByMotifStab
   *
   * 1/ update octotropes (octotropes) from this.currentSelectedOps (ops selected by user)
   * 2/ call update pcdDto of elements of this.listOrbits from octotropes selected (for update template)
   *
   * @private
   */
  private updateOctotropes() {
    // first step
    let newOctotropes = [...this.octotropes]
    for (let i = 0; i < this.octotropes.length; i++) {
      // if current selected operations are include into "octotrope",
      // select this group of orbits shearing same stabilizer
      if (ArrayUtil.isIncludeIn(
        this.currentSelectedOps,
        this.octotropes[i].pcs.orbit.metaStabilizer.metaStabOperations))
      {
        newOctotropes[i] = {...this.octotropes[i], selected: true, active: true}
      } else if (this.octotropes[i].selected) {
        newOctotropes[i] = {...this.octotropes[i], selected: false, active: false}
      }
    }
    this.octotropes = newOctotropes
    // second step
    this.update88musicsFromOctotropesSelectedAndActive()
  }

  update88musicsFromOctotropesSelectedAndActive() {
    let newMusaicOrbits: IOrbitMusaic[] = []
    let color: string = "black"
    this.nbMusaicsMatch = 0

    // loop over 88 musaics
    this.listOrbits.forEach(musaic => {
      color = "black"
      // search if current musaic match
      for (let i = 0; i < this.octotropes.length; i++) {
        if (this.octotropes[i].pcs.orbit.metaStabilizer.hashCode() === musaic.pcsDto.pcs.orbit.metaStabilizer.hashCode()
          && this.octotropes[i].selected
          && this.octotropes[i].active) {
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
    return this.listOrbits.reduce((countSameColor, orbit) =>
      orbit.pcsDto.colorPitchOn === color ? countSameColor + 1 : countSameColor, 0);
  }

  doSelectOrbitsHavingSameMetaStabilizerThan(index: number) {
    if (! this.octotropes[index].selected) { return }
    // toggle active octotrope if octotrope active > 1 (avoid empty selection)
    if (index > -1) {
      if (this.octotropes.reduce((previousValue: number, currentValue) =>
          currentValue.active ? previousValue + 1 : previousValue, 0) > 1
        || !this.octotropes[index].active
      )
        this.octotropes[index] = {...this.octotropes[index], active: !this.octotropes[index].active}
      this.update88musicsFromOctotropesSelectedAndActive()
    }
  }

  pcsMatchOperationStabilizersSelected(pcsRepresentative: IPcs): boolean {
    const metaStabilizerOps = pcsRepresentative.orbit.metaStabilizer.metaStabOperations
    let match = true
    for (let i = 1; i < this.currentSelectedOps.length; i++) {
      const operation = this.currentSelectedOps[i]
      if (!metaStabilizerOps.includes(operation)) {
        match = false
      }
    }
    return match
  }

  private searchMusaicThatMatches(searchData: ISearchPcs) {
    let newMusaicOrbits: IOrbitMusaic[] = []
    let color: string = "black"
    this.nbMusaicsMatch = 0

    // loop over 88 musaics
    this.listOrbits.forEach(musaic => {
      color = "black"
      // search if current musaic match one pcs of somePcs
      for (let i = 0; i < searchData.somePcs.length; i++) {
        const pcs = searchData.somePcs[i]
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


  doSelectOctotrope(index: number) {
    // toggle active octotrope if octotrope active > 1 (avoid empty selection)
    if (index > -1) {
      for (let i = 0; i < this.octotropes.length; i++) {
        if (this.octotropes[i].active && i !== index) {
          this.octotropes[i] = {...this.octotropes[i], active: false}
        }
      }
      if (!this.octotropes[index].active) {
        this.octotropes[index] = {...this.octotropes[index], active: true}
      }
      this.indexSelectedOctotrope = index
      this.saveConfigurationPage();
      this.update88musicsFromOctotropesSelectedAndActive()
    }
  }

  private saveConfigurationPage() {
    this.managerLocalStorageService.savePageThe88(
      {
        selectedOps: this.currentSelectedOps,
        indexTab: this.matTabGroup.selectedIndex || 0,
        indexSelectedOctotrope: this.indexSelectedOctotrope
      }
    )
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent) {
    switch (tabChangeEvent.index) {
      case 0 :
        this.updateOctotropes()
        break
      case 1 :
        // select all octotropes (active false)
        for (let i = 0; i < this.octotropes.length; i++) {
          if (!this.octotropes[i].selected) {
            this.octotropes[i] = {...this.octotropes[i], selected: true, active: false}
          }
        }
        this.doSelectOctotrope(this.indexSelectedOctotrope)
        break
      case 2 :
        this.searchMusaicThatMatches(this.searchPcsInput)
        break
    }

    this.saveConfigurationPage()
  }

  numberOfPcsInSelectedOctotropes() {
    return this.octotropes.filter(octotrope => octotrope.active)
      .reduce((numberOfPcs: number, octotrope) =>
        numberOfPcs + octotrope.numberOfPcs, 0)
  }

  private getNumberCyclicPF(orbits: Orbit[]) {
    let cyclicOrbits: number[] = []
    for (let i = 0; i < orbits.length; i++) {
      for (let j = 0; j < orbits[i].ipcsset.length; j++) {
        const cyclicPF = orbits[i].ipcsset[j].cyclicPrimeForm()
        if (!cyclicOrbits.includes(cyclicPF.id)) {
          cyclicOrbits.push(cyclicPF.id)
        }
      }
    }
    return cyclicOrbits.length
  }

  numberOfCyclicOrbitsInSelectedOctotropes() {
    return this.octotropes.filter(
      octotrope => octotrope.active)
      .reduce((numberOfCyclicPF: number, octotrope) =>
        numberOfCyclicPF + octotrope.numberOfCyclicOrbits, 0)
  }

  /**
   * Call for retrieve octotrope selected by user when this.matTabGroup.selectedIndex == 1
   */
  getOnlyOctotropeTabSelectedActive(): IOctotrope {
    return this.octotropes.filter(octotropre => octotropre.active)[0];
  }
}
