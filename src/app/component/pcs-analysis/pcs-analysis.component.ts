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
import {MatTooltip} from "@angular/material/tooltip";
import {MusaicOperation} from "../../core/MusaicOperation";
import {MusaicComponent} from "../musaic/musaic.component";
import {OctotropeComponent} from "../octotrope/octotrope.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatTooltip,
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
    // this.pcsList = this.managerHomePcsService.pcsList
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
    let cardinal = pcs.cardOrbitMode()
    for (let degree = 0; degree < cardinal; degree++) {
      this.managerPagePcsListService.addPcs(PcsAnalysisComponent.ROMAIN[degree], pcs, true)
      pcs = pcs.modulation(IPcs.NEXT_DEGREE)
    }
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
    let pcsSameIV = PcsSearch.searchPcsWithThisIV(pcs.iv().toString())
    if (pcs.orbit?.groupAction) {
      pcsSameIV = pcsSameIV.map((pcsSameIV) => pcs.orbit!.groupAction!.getIPcsInOrbit(pcsSameIV))
    }
    return pcsSameIV
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

  primeFormOrbitWithSameMotifStabilizersOf(pcs: IPcs): IPcs[] {
    return EightyEight.getPrimeFormMusaicsWithSameMotifStabilizersOf(pcs)
  }

  colorOrbit(pcsRepr: IPcs) {
    return PcsColor.getColor(pcsRepr.orbit.motifStabilizer.name);
  }

  /**
   * Get string composed of operations name of musaic group action which stabilize pcs argument
   * Example : "M1-T0 M11-T0"
   * @param pcs
   */
  operationsStabilizerOf(pcs: IPcs) {
    if (pcs.n !== 12) throw Error("Waiting n = 12")
    let operationStab: MusaicOperation[] = []
    const operations: MusaicOperation[] = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).operations
    operations.forEach(operation => {
      if (operation.actionOn(pcs).id === pcs.id) {
        operationStab.push(operation)
      }
    })
    operationStab.sort(MusaicOperation.compareStab)
    return operationStab.map( (operationStab) => operationStab.toString()).join(" ");
  }

}
