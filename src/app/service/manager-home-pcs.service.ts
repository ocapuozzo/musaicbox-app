import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {ManagerPcsService} from "./manager-pcs.service";

@Injectable({
  providedIn: 'root'
})
export class ManagerHomePcsService {

  @Output() updatePcs = new EventEmitter<IPcs>();

  pcs: IPcs = new IPcs({strPcs:'0,2,4,5,7,9,11'})

  constructor(private readonly managerPcsService: ManagerPcsService) { }

  transformeByMxT0(x:number) {
    this.pcs = this.managerPcsService.transformeByMxT0(this.pcs, x)
    this.updatePcs.emit(this.pcs)
  }

  translateByM1Tx(x:number) {
    this.pcs = this.managerPcsService.translateByM1Tx(this.pcs, x)
    this.updatePcs.emit(this.pcs)
  }

  complement() {
    this.pcs = this.managerPcsService.complement(this.pcs)
    this.updatePcs.emit(this.pcs)
  }

  modulation(direction : number) {
    this.pcs = this.managerPcsService.modulation(this.pcs, direction)
    this.updatePcs.emit(this.pcs)
  }

  toggleIndexOrSetIPivot(index: number) {

    this.pcs = this.managerPcsService.toggleInnerIndexOrSetIPivot(this.pcs, index)
    this.updatePcs.emit(this.pcs)
  }

  toggleIndex(index: number) {
    this.pcs = this.managerPcsService.toggleIndexFromMapped(this.pcs, index)
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
