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

  historyPcs : HistoryPcs

  constructor(private readonly managerPcsService: ManagerPcsService) {
    this.historyPcs = new HistoryPcs()
    this.historyPcs.pushInPast(this.trySetPivotFromSymmetry(this.pcs))
  }

  transformeByMxT0(x:number) {
    this.pcs = this.managerPcsService.transformeByMxT0(this.pcs, x)
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  translateByM1Tx(x:number) {
    this.pcs = this.managerPcsService.translateByM1Tx(this.pcs, x)
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  complement() {
    this.pcs = this.managerPcsService.complement(this.pcs)
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  modulation(direction : number) {
    this.pcs = this.managerPcsService.modulation(this.pcs, direction)
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  toggleIndexOrSetIPivot(index: number) {
    this.pcs = this.managerPcsService.toggleInnerIndexOrSetIPivot(this.pcs, index)
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  toggleIndex(index: number) {
    this.pcs = this.managerPcsService.toggleIndexFromMapped(this.pcs, index)
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  refresh() {
    this.updatePcsEvent.emit(this.pcs)
  }

  autoMap() {
    this.pcs = this.pcs.autoMap()
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  unMap() {
    this.pcs = this.pcs.unMap()
    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  replaceBy(newPcs: IPcs): void {
    // same pcs as current ?
    // certainly with other iPivot (rem iPivot  is "transient", id is not based on iPivot)
    const currentPcs = this.historyPcs.getCurrentPcs()
    if (currentPcs && newPcs.equalsPcs(currentPcs) && newPcs.iPivot !== currentPcs.iPivot) {
      //or: if (pcs.equalsPcs(this.managerPagePcsService.getCurrentPcs())) {
      // no change iPivot
      this.pcs = newPcs
    } else {
      // new pcs, try set better iPivot (if possible)
      this.trySetPivotFromSymmetry(newPcs)
      // when, or if, done, center pcs on this pivot
      newPcs = newPcs.modalPrimeForm()
      this.pcs = this.trySetPivotFromSymmetry(newPcs)
    }

    this.historyPcs.pushInPast(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

  detachPcs() {
    this.pcs = this.managerPcsService.doDetach(this.pcs)
    this.historyPcs.pushInPast(this.pcs)
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

  canUndo() : boolean {
    return this.historyPcs.canUndo()
  }

  canRedo() : boolean {
    return this.historyPcs.canRedo()
  }

  getCurrentPcs() : IPcs | undefined {
    return this.historyPcs.getCurrentPcs()
  }

  getPrevCurrentPcs() {
    return this.historyPcs.getPrevCurrentPcs()
  }

  /**
   * Try to define iPivot from symmetries of pcs, if possible
   * Rem : change transient state of his argument
   * @param newPcs in-out
   * @private
   * @return newPcs (same ref) with, perhaps, its iPivot changed
   */
  private trySetPivotFromSymmetry(newPcs: IPcs): IPcs {
    if (newPcs.n !== 12) throw Error("pcs.n = " + newPcs.n + " invalid (must be 12 digits)")
    // experimental : select a pivot from axe symmetry
    let symmetries = newPcs.getAxialSymmetries()
    const firstIndexInter = symmetries.symInter.findIndex((value) => value === 1)
    const firstIndexMedian = symmetries.symMedian.findIndex((value) => value === 1)
    if (firstIndexMedian >= 0) {
      if (newPcs.abinPcs[firstIndexMedian] === 1) {
        newPcs.setPivot(firstIndexMedian)
      } else if (newPcs.abinPcs[(firstIndexMedian + 6) % newPcs.n] === 1) { // ok normally...
        newPcs.setPivot((firstIndexMedian + 6) % newPcs.n )
      }
    } else {
      if (firstIndexInter >= 0) {
        if (newPcs.abinPcs[firstIndexInter] === 1) {
          newPcs.setPivot(firstIndexInter)
        } else if (newPcs.abinPcs[(firstIndexInter + 6) % newPcs.n ] === 1)  {
          newPcs.setPivot((firstIndexInter + 6 ) % newPcs.n)
        }
      }
    }
    return newPcs
  }
}
