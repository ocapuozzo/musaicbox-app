import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [],
  templateUrl: './pcs-analysis.component.html',
  styleUrl: './pcs-analysis.component.css'
})

export class PcsAnalysisComponent {

  // @Input() pcs: IPcs = new IPcs({strPcs:'[0,1,3,6,7,8]'})

  private _pcs : IPcs

  /**
   * image mapped in 12 of _pcs
   */
  pcsMapped12 : IPcs

  @Input() set pcs(value : IPcs) {
    this._pcs = value
    this.pcsMapped12 = value.n == 12 ? value : new IPcs({binPcs:value.getMappedBinPcs()})
  }
  get pcs() : IPcs {
    return this._pcs
  }
  ngOnInit() {

  }
}
