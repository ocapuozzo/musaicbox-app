import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerHomePcsService {

  @Output() updatePcs = new EventEmitter<IPcs>();

  pcs: IPcs = new IPcs({strPcs:'0,3,6'})

  constructor() { }

  transformeByMxT0(x:number) {
    this.pcs = this.pcs.affineOp(x, 0)
    this.updatePcs.emit(this.pcs)
  }

  translateByM1Tx(x:number) {
    this.pcs = this.pcs.affineOp(1, x)
    this.updatePcs.emit(this.pcs)
  }

  complement() {
    this.pcs = this.pcs.complement()
    this.updatePcs.emit(this.pcs)
  }


  toggleIndexOrSetIPivot(index: number) {
    // TODO change because possible mapping
    if (this.pcs.abinPcs[index] === 0) {
      this.pcs = this.pcs.toggleIndexPC(index)
    } else {
      if (index < this.pcs.n) {
        this.pcs =
          new IPcs({strPcs: this.pcs.getPcsStr(), iPivot: index})
      } else {
        throw new Error("Invalid iPivot : " + index)
      }
    }
    this.updatePcs.emit(this.pcs)
  }
}
