import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerPagePcsListService {

  @Output() updatePcsList = new EventEmitter<Map<string, IPcs[]>>();

  labeledListPcs : Map<string, IPcs[]> = new Map<string, IPcs[]>()

  compteur  = 0

  constructor() { }

  addPcs(title: string, pcs: IPcs) {

    if (! this.labeledListPcs.has(title)) {
      this.labeledListPcs.set(title, [pcs])
    } else {
      this.labeledListPcs.get(title)?.push(pcs)
    }
    // this.arrayLabeledListPcs.push( {title:title, pcsList:[pcs]})
    this.updatePcsList.emit(this.labeledListPcs)
  }

  removePcs(pcs: IPcs) {
    for (const [title, pcsList] of this.labeledListPcs) {
      const index = pcsList.findIndex((p) => p.id == pcs.id )
      if (index >= 0) {
        pcsList.splice(index,1)
        if (pcsList.length == 0) {
          this.labeledListPcs.delete(title)
        }
        this.updatePcsList.emit(this.labeledListPcs)
        break
      }
    }
  }

  clearList() {
    this.labeledListPcs.clear()
    this.updatePcsList.emit(this.labeledListPcs)
  }
}
