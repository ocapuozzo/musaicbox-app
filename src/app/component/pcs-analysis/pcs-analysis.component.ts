import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {IScaleName} from "../../core/IScaleName";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [
    MatButton,
    MatIcon
  ],
  templateUrl: './pcs-analysis.component.html',
  styleUrl: './pcs-analysis.component.css'
})

export class PcsAnalysisComponent {

   pcs : IPcs = new IPcs({strPcs:'0'})

  /**
   * image mapped in 12 of _pcs
   */
  pcsMapped12 : IPcs = new IPcs({strPcs:'4,2'})


  static ROMAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']


  constructor(private readonly managerHomePcsListService: ManagerPagePcsListService,
              private readonly managerHomePcsService: ManagerPagePcsService) {
    // this.pcs = this.managerHomePcsService.pcs
    this.managerHomePcsService.updatePcsEvent.subscribe((pcs: IPcs) => {
      this.pcs = pcs
      this.pcsMapped12 = this.pcs.n == 12 ? this.pcs : new IPcs({binPcs:this.pcs.getMappedBinPcs()})
      // if (this.pcs.orbit.stabilizers) {
      //   console.log("this.pcs.orbit.stabilizers.length = " + this.pcs.orbit.stabilizers.length)
      //   console.log("this.pcs.orbit.name = " + this.pcs.orbit.name)
      // }
    })
  }

  ngOnInit() {
    this.pcs = this.managerHomePcsService.pcs
    this.pcsMapped12 = this.pcs.n == 12 ? this.pcs : new IPcs({binPcs:this.pcs.getMappedBinPcs()})
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
    const cyclicGroup = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    this.managerHomePcsService.replaceBy(cyclicGroup.getIPcsInOrbit(pcs))
  }

  doPushOrbitDihedralPF(pcs: IPcs) {
    const dGroup = GroupAction.predefinedGroupsActions(12, Group.DIHEDRAL)
    this.managerHomePcsService.replaceBy(dGroup.getIPcsInOrbit(pcs))
  }

  doPushOrbitAffinePF(pcs: IPcs) {
    const afGroup = GroupAction.predefinedGroupsActions(12, Group.AFFINE)
    this.managerHomePcsService.replaceBy(afGroup.getIPcsInOrbit(pcs))
  }
  doPushOrbitMusaicPF(pcs: IPcs) {
    const musGroup = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    this.managerHomePcsService.replaceBy(musGroup.getIPcsInOrbit(pcs))
  }

  doPushModesOf(pcs: IPcs) {
    let cardinal = pcs.cardinal
    for (let degree = 0; degree < cardinal ; degree++) {
      this.managerHomePcsListService.addPcs(PcsAnalysisComponent.ROMAIN[degree], pcs)
      pcs = pcs.modulation(IPcs.NEXT_DEGREE)
    }
  }
}
