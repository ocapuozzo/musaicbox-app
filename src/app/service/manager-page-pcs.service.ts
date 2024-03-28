import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {ManagerPcsService} from "./manager-pcs.service";
import {HistoryPcs} from "../utils/HistoryPcs";
import {consolidateMessages} from "@angular/localize/tools/src/extract/translation_files/utils";

@Injectable({
  providedIn: 'root'
})
export class ManagerPagePcsService {

  @Output() updatePcsEvent = new EventEmitter<IPcs>();

  pcs: IPcs = new IPcs({strPcs:'0,2,4,5,7,9,11'})

  historyPcs = new HistoryPcs()

  constructor(private readonly managerPcsService: ManagerPcsService) { }

  transformeByMxT0(x:number) {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.managerPcsService.transformeByMxT0(this.pcs, x)
    this.updatePcsEvent.emit(this.pcs)
  }

  translateByM1Tx(x:number) {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.managerPcsService.translateByM1Tx(this.pcs, x)
    this.updatePcsEvent.emit(this.pcs)
  }

  complement() {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.managerPcsService.complement(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  modulation(direction : number) {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.managerPcsService.modulation(this.pcs, direction)
    this.updatePcsEvent.emit(this.pcs)
  }

  toggleIndexOrSetIPivot(index: number) {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.managerPcsService.toggleInnerIndexOrSetIPivot(this.pcs, index)
    this.updatePcsEvent.emit(this.pcs)
  }

  toggleIndex(index: number) {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.managerPcsService.toggleIndexFromMapped(this.pcs, index)
    this.updatePcsEvent.emit(this.pcs)
  }

  refresh() {
    this.updatePcsEvent.emit(this.pcs)
  }

  autoMap() {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.pcs.autoMap()
    this.updatePcsEvent.emit(this.pcs)
  }

  unMap() {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.pcs.unMap()
    this.updatePcsEvent.emit(this.pcs)
  }

  replaceBy(newPcs: IPcs): void {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = newPcs
    this.updatePcsEvent.emit(this.pcs)
  }

  detachPcs() {
    this.historyPcs.pushInPast(this.pcs)
    this.pcs = this.managerPcsService.doDetach(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  unDoPcs() {
    // save also actual pcs (parameter to unDoToPresent)
    let pcs = this.historyPcs.unDoToPresent(this.pcs)
    if (pcs != undefined) {
      this.pcs = pcs
      this.updatePcsEvent.emit(this.pcs)
    }
  }

  reDoPcs() {
    let pcs = this.historyPcs.reDoToPresent()
    if (pcs != undefined) {
      this.pcs = pcs
      this.updatePcsEvent.emit(this.pcs)
    }
  }

}
