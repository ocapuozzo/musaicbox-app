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
    this.pcs = this.pcs.translation(x)
    this.updatePcs.emit(this.pcs)
  }

  complement() {
    this.pcs = this.pcs.complement()
    this.updatePcs.emit(this.pcs)
  }

  modulation(direction : number) {
    this.pcs = this.pcs.modulation(direction)
    this.updatePcs.emit(this.pcs)
  }

  toggleIndexOrSetIPivot(index: number) {
    // inner index (no mapping index)
    if (this.pcs.abinPcs[index] === 0) {
      this.pcs = this.pcs.toggleIndexPC(index)
    } else {
      if (index < this.pcs.n && index >= 0) {
        this.pcs =
          new IPcs({
            strPcs: this.pcs.getPcsStr(),
            iPivot: index,
            n: this.pcs.n,
            orbit:this.pcs.orbit,
            mappingBinPcs: this.pcs.templateMappingBinPcs,
            nMapping: this.pcs.nMapping
          })
      } else {
        throw new Error("Invalid iPivot : " + index)
      }
    }
    this.updatePcs.emit(this.pcs)
  }

  toggleIndex(index: number) {
    this.pcs = this.pcs.toggleIndexPC(this.pcs.indexMappedToIndexInner(index))
    this.updatePcs.emit(this.pcs)
  }

  refresh() {
    this.updatePcs.emit(this.pcs)
  }

  autoMap() {
    this.pcs = this.pcs.autoMap()
    this.updatePcs.emit(this.pcs)
  }

  unMap() {
    this.pcs = this.pcs.unMap()
    this.updatePcs.emit(this.pcs)
  }

}
