import {Component} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {PcsSearch} from "../../utils/PcsSearch";
import {EightyEight} from "../../utils/EightyEight";
import {PcsColor} from "../../color/PcsColor";
import {MusaicComponent} from "../musaic/musaic.component";
import {OctotropeComponent} from "../octotrope/octotrope.component";
import {NgClass, NgIf} from "@angular/common";
import {HtmlUtil} from "../../utils/HtmlUtil";
import {ManagerGroupActionService} from "../../service/manager-group-action.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MusaicComponent,
    OctotropeComponent,
    NgIf,
    NgClass
  ],
  templateUrl: './pcs-analysis.component.html',
  styleUrl: './pcs-analysis.component.css'
})

export class PcsAnalysisComponent {
  currentBuildVersion = environment.buildVersion
  pcs: IPcs = new IPcs({strPcs: '0'})

  /**
   * image mapped in 12 of _pcs
   */
  pcsMapped: IPcs = new IPcs({strPcs: '4,2'})


  static ROMAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

  constructor(private readonly managerPagePcsListService: ManagerPagePcsListService,
              private readonly managerPagePcsService: ManagerPagePcsService
  ) {

    this.managerPagePcsService.updatePcsEvent.subscribe((pcs: IPcs) => {
      this.pcs = pcs
      this.pcsMapped = this.pcs.unMap()
    })
  }

  ngOnInit() {
    this.pcs = this.managerPagePcsService.pcs
    this.pcsMapped = this.pcs.unMap()
  }

  fixedPcsList() {
    const stabilizers = this.pcs.orbit.stabilizers
    if (this.managerPagePcsListService.isAlreadyShowFixedPcs(stabilizers.toString())) {
      return
    }
    for (const stab of stabilizers) {
      for (let i = 0; i < stab.fixedPcs.length; i++) {
        this.managerPagePcsListService.addPcs(stab.getShortName(), stab.fixedPcs[i])
      }
    }
    this.managerPagePcsListService.addStabilizersFixedPcs(stabilizers.toString())
    HtmlUtil.gotoAnchor("idListPcs")
  }

  doPushOrbitCyclicPF(pcs: IPcs) {
    if (pcs.n === 12) {
      const cyclicGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
      this.managerPagePcsService.replaceBy(cyclicGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitDihedralPF(pcs: IPcs) {
    if (pcs.n === 12) {
      const dGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName("Dihedral")!
      this.managerPagePcsService.replaceBy(dGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitAffinePF(pcs: IPcs) {
    if (pcs.n === 12) {
      const afGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName("Affine")!
      this.managerPagePcsService.replaceBy(afGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitMusaicPF(pcs: IPcs) {
    if (pcs.n == 12) {
      const musGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
      this.managerPagePcsService.replaceBy(musGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushModesOf(pcs: IPcs) {
    if (this.managerPagePcsListService.isAlreadyComputeModes(pcs)) {
      return
    }
    let cardinal = pcs.cardOrbitMode()
    for (let degree = 0; degree < cardinal; degree++) {
      this.managerPagePcsListService.addPcs(PcsAnalysisComponent.ROMAIN[degree], pcs, true)
      pcs = pcs.modulation("Next")
    }
    this.managerPagePcsListService.addModesOf(pcs.id)
    HtmlUtil.gotoAnchor("idListPcs")
  }

  doPushSymmetryPF(pcs: IPcs) {
    if (pcs.n === 12) {
      this.managerPagePcsService.replaceBy(pcs.symmetryPrimeForm())
    }
  }

  doPushCyclicPF(pcs: IPcs) {
    if (pcs.n === 12) {
      this.managerPagePcsService.replaceBy(pcs.cyclicPrimeForm())
    }
  }

  doPushDihedralPF(pcs: IPcs) {
    if (pcs.n === 12) {
      this.managerPagePcsService.replaceBy(pcs.dihedralPrimeForm())
    }
  }

  doPushAffinePF(pcs: IPcs) {
    if (pcs.n === 12) {
      this.managerPagePcsService.replaceBy(pcs.affinePrimeForm())
    }
  }

  doPushMusaicPF(pcs: IPcs) {
    if (pcs.n === 12) {
      this.managerPagePcsService.replaceBy(pcs.musaicPrimeForm())
    }
  }

  pcsWithSameIVas(pcs: IPcs): IPcs[] {
    let pcsHavingSameIV = PcsSearch.searchPcsWithThisIV(pcs.iv().toString())
    if (pcs.orbit?.groupAction) {
      pcsHavingSameIV = pcsHavingSameIV.map((pcsSameIV) => pcs.orbit!.groupAction!.getIPcsInOrbit(pcsSameIV))
    } else {
      pcsHavingSameIV = pcsHavingSameIV.map((pcsSameIV) => pcsSameIV.cloneDetached())
    }
    return pcsHavingSameIV
  }

  doReplaceBy(pcs: IPcs) {
    this.managerPagePcsService.replaceBy(pcs)
  }


  doReplaceByPcsWithIS(intervallicStructureNumbers: number[]) {
    const pcs = PcsSearch.searchPcsWithThisIS(intervallicStructureNumbers.toString())
    if (pcs) {

      this.managerPagePcsService.replaceBy(pcs)
    }
  }

  doPushToPcsPage(pcs: IPcs) {
    this.managerPagePcsService.replaceBy(pcs)
  }

  protected readonly EightyEight = EightyEight;

  primeFormOrbitWithSameMetaStabilizersOf(pcs: IPcs): IPcs[] {
    return EightyEight.getPrimeFormMusaicsWithSameMetaStabilizerOf(pcs)
  }

  colorOrbit(pcsRepr: IPcs) {
    return PcsColor.getColor(pcsRepr.orbit.metaStabilizer.name);
  }

  /**
   * Get operations name of operations that stabilize the pcs given in argument
   * Example : ["M1-T0", "M11-T0"]
   * @param pcs
   */
  operationsStabilizerOf(pcs: IPcs) {
    if (pcs.n !== 12) throw Error("expected n = 12")

    let pcsToCompute: IPcs = pcs

    // when pcs no from group action or trivial group action, give from musaic because it is richer in information
    if (!pcs.isComingFromOrbit() || pcs.isComingFromTrivialOrbit()) {
      const groupMusaic = ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')
      pcsToCompute = groupMusaic!.getIPcsInOrbit(pcs)
    }

    const stabOperations = pcsToCompute.getStabilizerOperations()
    return {
      cardinal: stabOperations.length,
      names: stabOperations.map((op) => op.toString()) //.join(" ")
    }

  }

  pcsInMusaicGroup() {
    return this.pcs.isComingFromOrbit() ? this.pcs.n === 12 && this.pcs.orbit.groupAction?.group.operations.length===96 : false
  }

  getPcsHavingThisIS(intervallicStructureNumbers: number[]) {
    return  PcsSearch.searchPcsWithThisIS(intervallicStructureNumbers.toString())

  }
}
