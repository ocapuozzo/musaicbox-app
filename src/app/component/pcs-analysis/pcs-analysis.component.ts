import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {IScaleName} from "../../core/IScaleName";
import {PcsListComponent} from "../pcs-list/pcs-list.component";
import {PcsSearch} from "../../utils/PcsSearch";
import {ManagerPcsService} from "../../service/manager-pcs.service";
import {MusaicComponent} from "../musaic/musaic.component";
import {EightyEight} from "../../utils/EightyEight";
import {PcsColor} from "../../color/PcsColor";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MusaicComponent,
    MatTooltip
  ],
  templateUrl: './pcs-analysis.component.html',
  styleUrl: './pcs-analysis.component.css'
})

export class PcsAnalysisComponent {

   pcs : IPcs = new IPcs({strPcs:'0'})

  /**
   * image mapped in 12 of _pcs
   */
  pcsMapped : IPcs = new IPcs({strPcs:'4,2'})


  static ROMAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

  constructor(private readonly managerHomePcsListService: ManagerPagePcsListService,
              private readonly managerHomePcsService: ManagerPagePcsService
  ) {
    // this.pcsList = this.managerHomePcsService.pcsList
    this.managerHomePcsService.updatePcsEvent.subscribe((pcs: IPcs) => {
      this.pcs = pcs
      this.pcsMapped = this.pcs.n == 12
        ? this.pcs
        : new IPcs({binPcs:this.pcs.getMappedBinPcs()})
    })
  }

  ngOnInit() {
    this.pcs = this.managerHomePcsService.pcs
    this.pcsMapped = this.pcs.n == 12 ? this.pcs : new IPcs({binPcs:this.pcs.getMappedBinPcs()})
  }

  fixedPcsList() {
    const stabilizers = this.pcs.orbit.stabilizers
    for (const stab of stabilizers) {
      for (let i = 0; i < stab.fixedPcs.length ; i++) {
        this.managerHomePcsListService.addPcs(stab.getShortName(), stab.fixedPcs[i])
      }
    }
  }

  doPushOrbitCyclicPF(pcs : IPcs) {
    if (pcs.n == 12) {
      const cyclicGroup = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
      this.managerHomePcsService.replaceBy(cyclicGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitDihedralPF(pcs: IPcs) {
    if (pcs.n == 12) {
      const dGroup = GroupAction.predefinedGroupsActions(12, Group.DIHEDRAL)
      this.managerHomePcsService.replaceBy(dGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushOrbitAffinePF(pcs: IPcs) {
    if (pcs.n == 12) {
      const afGroup = GroupAction.predefinedGroupsActions(12, Group.AFFINE)
      this.managerHomePcsService.replaceBy(afGroup.getIPcsInOrbit(pcs))
    }
  }
  doPushOrbitMusaicPF(pcs: IPcs) {
    if (pcs.n == 12) {
      const musGroup = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
      this.managerHomePcsService.replaceBy(musGroup.getIPcsInOrbit(pcs))
    }
  }

  doPushModesOf(pcs: IPcs) {
    let cardinal = pcs.cardOrbitMode()
    for (let degree = 0; degree < cardinal ; degree++) {
      this.managerHomePcsListService.addPcs(PcsAnalysisComponent.ROMAIN[degree], pcs, true)
      pcs = pcs.modulation(IPcs.NEXT_DEGREE)
    }
  }

  doPushModalPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerHomePcsService.replaceBy(pcs.modalPrimeForm())
    }
  }

  doPushCyclicPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerHomePcsService.replaceBy(pcs.cyclicPrimeForm())
    }
  }

  doPushDihedralPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerHomePcsService.replaceBy(pcs.dihedralPrimeForm())
    }
  }

  doPushAffinePF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerHomePcsService.replaceBy(pcs.affinePrimeForm())
    }
  }

  doPushMusaicPF(pcs: IPcs) {
    if (pcs.n == 12) {
      this.managerHomePcsService.replaceBy(pcs.musaicPrimeForm())
    }
  }

  pcsWithSameIVas(pcs: IPcs) : IPcs[] {
    let pcsList =  PcsSearch.searchPcsWithThisIV(pcs.iv().toString())
    if (pcs.orbit?.groupAction) {
      // @ts-ignore
      pcsList = pcsList.map((pcsSameIV) => pcs.orbit.groupAction.getIPcsInOrbit(pcsSameIV))
    }
    return pcsList
  }

  doReplaceBy(pcs: IPcs){
    this.managerHomePcsService.replaceBy(pcs)
  }

  doPushToPcsPage(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
  }

  protected readonly EightyEight = EightyEight;

  orbitWithSameMetaStabilizersOf(pcs: IPcs): IPcs[] {
    return EightyEight.getMusaicsWithSameMetaStabilizersOf(pcs)

  }

  colorOrbit(pcsRepr: IPcs) {
    return PcsColor.getColor(pcsRepr.orbit.motifStabilizer.name);
  }
}
