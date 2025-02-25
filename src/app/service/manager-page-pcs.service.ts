import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {ManagerPcsService} from "./manager-pcs.service";
import {HistoryT} from "../utils/HistoryT";


@Injectable({
  providedIn: 'root'
})
export class ManagerPagePcsService {

  @Output() updatePcsEvent = new EventEmitter<IPcs>();

  pcs: IPcs = new IPcs({strPcs: '0,2,4,5,7,9,11'})

  historyPcs: HistoryT<IPcs>

  /**
   * (experimental) for Whiteboard page
   * @private
   */
  public indexPcsForEdit: number;

  constructor(private readonly managerPcsService: ManagerPcsService) {
    this.historyPcs = new HistoryT<IPcs>()
    this.historyPcs.pushIntoPresent(this.pcs)
  }

  transformeByMxT0(x: number) {
    this.pcs = this.managerPcsService.transformeByMxT0(this.pcs, x)
    this.setPcsAsPresentToHistoryAndEmit();
  }

  translateByM1Tx(x: number) {
    this.pcs = this.managerPcsService.translateByM1Tx(this.pcs, x)
    this.setPcsAsPresentToHistoryAndEmit();
  }

  complement() {
    this.pcs = this.managerPcsService.complement(this.pcs)
    this.setPcsAsPresentToHistoryAndEmit();
  }

  modulation(direction: number) {
    this.pcs = this.managerPcsService.modulation(this.pcs, direction)
    this.setPcsAsPresentToHistoryAndEmit();
  }

  toggleIndexOrSetIPivot(index: number) {
    this.pcs = this.managerPcsService.toggleInnerIndexOrSetIPivot(this.pcs, index)
    this.setPcsAsPresentToHistoryAndEmit();
  }

  toggleIndex(index: number) {
    this.pcs = this.managerPcsService.toggleIndexFromMapped(this.pcs, index)
    this.setPcsAsPresentToHistoryAndEmit();
  }

  refresh() {
    this.updatePcsEvent.emit(this.pcs)
  }

  autoMap() {
    this.pcs = this.pcs.autoMap()
    this.setPcsAsPresentToHistoryAndEmit();
  }

  unMap() {
    this.pcs = this.pcs.unMap()
    this.setPcsAsPresentToHistoryAndEmit();
  }

  replaceBy(newPcs: IPcs, indexPcsForEdit : number = -1): void {
    this.pcs = newPcs
    this.indexPcsForEdit = indexPcsForEdit
    this.setPcsAsPresentToHistoryAndEmit();
  }

  detachPcs() {
    this.pcs = this.managerPcsService.doDetach(this.pcs)
    this.setPcsAsPresentToHistoryAndEmit();
  }

  unDoPcs() {
    // save also actual pcs (parameter to unDoToPresent)
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
    return this.historyPcs.getCurrent()
  }

  getPrevCurrentPcs() {
    return this.historyPcs.getPrevCurrentPcs()
  }

  private setPcsAsPresentToHistoryAndEmit() {
    this.historyPcs.pushIntoPresent(this.pcs)
    this.updatePcsEvent.emit(this.pcs)
  }

}
