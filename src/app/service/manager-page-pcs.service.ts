import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {ManagerPcsService} from "./manager-pcs.service";
import {HistoryPcs} from "../utils/HistoryPcs";
import {consolidateMessages} from "@angular/localize/tools/src/extract/translation_files/utils";
import {HistoryT} from "../utils/HistoryT";

@Injectable({
  providedIn: 'root'
})
export class ManagerPagePcsService {

  @Output() updatePcsEvent = new EventEmitter<IPcs>();

  pcs: IPcs = new IPcs({strPcs: '0,2,4,5,7,9,11'})

  historyPcs: HistoryT<IPcs>

  constructor(private readonly managerPcsService: ManagerPcsService) {
    this.historyPcs = new HistoryT<IPcs>()
    this.historyPcs.pushIntoPresent(this.pcs)
  }

  transformeByMxT0(x: number) {
    this.pcs = this.managerPcsService.transformeByMxT0(this.pcs, x)
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  translateByM1Tx(x: number) {
    this.pcs = this.managerPcsService.translateByM1Tx(this.pcs, x)
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  complement() {
    this.pcs = this.managerPcsService.complement(this.pcs)
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  modulation(direction: number) {
    this.pcs = this.managerPcsService.modulation(this.pcs, direction)
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  toggleIndexOrSetIPivot(index: number) {
    this.pcs = this.managerPcsService.toggleInnerIndexOrSetIPivot(this.pcs, index)
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  toggleIndex(index: number) {
    this.pcs = this.managerPcsService.toggleIndexFromMapped(this.pcs, index)
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  refresh() {
    this.updatePcsEvent.emit(this.pcs)
  }

  autoMap() {
    this.pcs = this.pcs.autoMap()
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  unMap() {
    this.pcs = this.pcs.unMap()
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  replaceBy(newPcs: IPcs): void {
    this.pcs = newPcs
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  detachPcs() {
    this.pcs = this.managerPcsService.doDetach(this.pcs)
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  unDoPcs() {
    // save also actual pcsList (parameter to unDoToPresent)
    let pcs = this.historyPcs.unDoToPresent()
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

  canUndo(): boolean {
    return this.historyPcs.canUndo()
  }

  canRedo(): boolean {
    return this.historyPcs.canRedo()
  }

  getCurrentPcs(): IPcs | undefined {
    return this.historyPcs.getCurrentPcs()
  }

  getPrevCurrentPcs() {
    return this.historyPcs.getPrevCurrentPcs()
  }

}
