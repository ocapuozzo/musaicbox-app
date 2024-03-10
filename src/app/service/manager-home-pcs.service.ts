import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerHomePcsService {

  @Output() updatePcs = new EventEmitter<IPcs>();

  pcs: IPcs = new IPcs({strPcs:'0,2,4,5,7,9,11'})

  constructor() { }

  transformeByMxT0(x:number) {
    const newPcs = this.pcs.affineOp(x, 0)
    if (this.pcs.orbit?.groupAction) {  // !isDetached()
      this.pcs = this.pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    } else {
      this.pcs = newPcs
    }
    this.updatePcs.emit(this.pcs)
  }

  translateByM1Tx(x:number) {
    const newPcs = this.pcs.translation(x)
    if (this.pcs.orbit?.groupAction) {  // !isDetached()
      this.pcs = this.pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    } else {
      this.pcs = newPcs
    }
    this.updatePcs.emit(this.pcs)
  }

  complement() {
    const newPcs = this.pcs.complement()
    if (this.pcs.orbit?.groupAction) {  // !isDetached()
      this.pcs = this.pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    } else {
      this.pcs = newPcs
    }
    this.updatePcs.emit(this.pcs)
  }

  modulation(direction : number) {
    const newPcs = this.pcs.modulation(direction)
    if (this.pcs.orbit?.groupAction) {  // !isDetached()
      this.pcs = this.pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    } else {
      this.pcs = newPcs
    }
    this.updatePcs.emit(this.pcs)
  }

  toggleIndexOrSetIPivot(index: number) {
    // inner index (no mapping index)
    let newPcs: IPcs
    if (this.pcs.abinPcs[index] === 0) {
      newPcs = this.pcs.toggleIndexPC(index)
    } else {
      if (index < this.pcs.n && index >= 0) {
        newPcs =
          new IPcs({
            strPcs: this.pcs.getPcsStr(),
            iPivot: index,
            n: this.pcs.n,
            orbit:this.pcs.orbit,
            templateMappingBinPcs: this.pcs.templateMappingBinPcs,
            nMapping: this.pcs.nMapping
          })
      } else {
        throw new Error("Invalid iPivot : " + index)
      }
    }
    if (this.pcs.orbit?.groupAction) {  // !isDetached()
      this.pcs = this.pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    } else {
      this.pcs = newPcs
    }
    this.updatePcs.emit(this.pcs)
  }

  toggleIndex(index: number) {
    const newPcs = this.pcs.toggleIndexPC(this.pcs.indexMappedToIndexInner(index))
    if (this.pcs.orbit?.groupAction) {  // !isDetached()
      this.pcs = this.pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    } else {
      this.pcs = newPcs
    }
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

  replaceBy(pcs: IPcs) {
    const newPcs = pcs //.translation(0) // copy
    if (this.pcs.orbit?.groupAction) {  // !isDetached()
      this.pcs = this.pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    } else {
      this.pcs = newPcs
    }
    this.updatePcs.emit(this.pcs)
  }

}
