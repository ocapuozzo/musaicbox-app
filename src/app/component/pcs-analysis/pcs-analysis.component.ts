import {Component} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {PcsSearch} from "../../utils/PcsSearch";
import {EightyEight} from "../../utils/EightyEight";
import {PcsColor} from "../../color/PcsColor";
import {MusaicOperation} from "../../core/MusaicOperation";
import {MusaicComponent} from "../musaic/musaic.component";
import {OctotropeComponent} from "../octotrope/octotrope.component";
import {NgIf} from "@angular/common";
import {HtmlUtil} from "../../utils/HtmlUtil";
import {ManagerGroupActionService} from "../../service/manager-group-action.service";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MusaicComponent,
    OctotropeComponent,
    NgIf
  ],
  templateUrl: './pcs-analysis.component.html',
  styleUrl: './pcs-analysis.component.css'
})

export class PcsAnalysisComponent {

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
    if (pcs.n == 12) {
      const cyclicGroup = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
      this.managerPagePcsService.replaceBy(cyclicGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitDihedralPF(pcs: IPcs) {
    if (pcs.n == 12) {
      const dGroup = GroupAction.predefinedGroupsActions(12, Group.DIHEDRAL)
      this.managerPagePcsService.replaceBy(dGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitAffinePF(pcs: IPcs) {
    if (pcs.n == 12) {
      const afGroup = GroupAction.predefinedGroupsActions(12, Group.AFFINE)
      this.managerPagePcsService.replaceBy(afGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitMusaicPF(pcs: IPcs) {
    if (pcs.n == 12) {
      const musGroup = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
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
      pcs = pcs.modulation(IPcs.NEXT_DEGREE)
    }
    this.managerPagePcsListService.addModesOf(pcs.id)
    HtmlUtil.gotoAnchor("idListPcs")
  }

  doPushModalPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerPagePcsService.replaceBy(pcs.modalPrimeForm())
    }
  }

  doPushCyclicPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerPagePcsService.replaceBy(pcs.cyclicPrimeForm())
    }
  }

  doPushDihedralPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerPagePcsService.replaceBy(pcs.dihedralPrimeForm())
    }
  }

  doPushAffinePF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerPagePcsService.replaceBy(pcs.affinePrimeForm())
    }
  }

  doPushMusaicPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerPagePcsService.replaceBy(pcs.musaicPrimeForm())
    }
  }

  pcsWithSameIVas(pcs: IPcs): IPcs[] {
    let pcsHavingSameIV = PcsSearch.searchPcsWithThisIV(pcs.iv().toString())
    if (pcs.orbit?.groupAction) {
      pcsHavingSameIV = pcsHavingSameIV.map((pcsSameIV) => pcs.orbit!.groupAction!.getIPcsInOrbit(pcsSameIV))
    } else {
      pcsHavingSameIV = pcsHavingSameIV.map((pcsSameIV) => pcsSameIV.detach())
    }
    return pcsHavingSameIV
  }

  doReplaceBy(pcs: IPcs) {
    this.managerPagePcsService.replaceBy(pcs)
  }


  doReplaceByPcsWithIS(numbers: number[]) {
    const pcs = PcsSearch.searchPcsWithThisIS(numbers.toString())
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
   * Example : "M1-T0 M11-T0"
   * @param pcs
   */
  operationsStabilizerOf(pcs: IPcs) {
    if (pcs.n !== 12) throw Error("Waiting n = 12")
    let operationStab: MusaicOperation[] = []

    // if pcs is detached then get stabilizers from Musaic group
    // else get stabilizers from its group
    const operations: MusaicOperation[] =
      pcs.isDetached()
        ? ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")?.operations ?? []
        // ?  GroupAction.predefinedGroupsActions(12, Group.MUSAIC).operations
        : pcs.orbit.groupAction!.group.operations

    operations.forEach(operation => {
      if (operation.actionOn(pcs).id === pcs.id) {
        operationStab.push(operation)
      }
    })
    operationStab.sort(MusaicOperation.compareStabMajorTMinorA)
    return {
      cardinal: operationStab.length,
      names: operationStab.map((operationStab) => operationStab.toString()).join(" ")
    }
  }

  pcsInMusaic() {
    return !this.pcs.isDetached() ? this.pcs.orbit.groupAction?.group.operations.length===96 : false
  }
}
