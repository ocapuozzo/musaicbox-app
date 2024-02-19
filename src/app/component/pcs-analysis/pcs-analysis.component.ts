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

  private _pcs : IPcs = new IPcs({strPcs:'0'})

  /**
   * image mapped in 12 of _pcs
   */
  pcsMapped12 : IPcs = new IPcs({strPcs:'4,2'})

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
