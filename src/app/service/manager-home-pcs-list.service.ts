import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerHomePcsListService {

  @Output() updatePcsList = new EventEmitter<IPcs[]>();
  pcsList : IPcs[] = [new IPcs({strPcs:'0,3,6,9'})]

  constructor() { }

  addPcs(pcs: IPcs) {
    this.pcsList.push(pcs)
    this.updatePcsList.emit(this.pcsList)
  }

  removePcs(pcs: IPcs) {
    this.pcsList = this.pcsList.filter((p) => p.id != pcs.id )
    this.updatePcsList.emit(this.pcsList)
  }

}
