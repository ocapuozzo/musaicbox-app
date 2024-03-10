import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {Analyse} from "../../utils/Analyse";
import {ManagerHomePcsListService} from "../../service/manager-home-pcs-list.service";
import {ManagerHomePcsService} from "../../service/manager-home-pcs.service";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [],
  templateUrl: './pcs-analysis.component.html',
  styleUrl: './pcs-analysis.component.css'
})

export class PcsAnalysisComponent {

   pcs : IPcs = new IPcs({strPcs:'0'})

  /**
   * image mapped in 12 of _pcs
   */
  pcsMapped12 : IPcs = new IPcs({strPcs:'4,2'})

  constructor(private readonly managerHomePcsListService: ManagerHomePcsListService,
              private readonly managerHomePcsService: ManagerHomePcsService) {
    // this.pcs = this.managerHomePcsService.pcs
    this.managerHomePcsService.updatePcs.subscribe((pcs: IPcs) => {
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
    // TODO this.pcs is not update when changed (ngModel ?)
    const stabilizers = this.pcs.orbit.stabilizers
    for (const stab of stabilizers) {
      for (let i = 0; i < stab.fixedPcs.length ; i++) {
        this.managerHomePcsListService.addPcs(stab.getShortName(), stab.fixedPcs[i])
      }
    }
  }
}
