import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerPageEightyHeightService {

  @Output() eventSearchMatchMusaic = new EventEmitter<IPcs[]>();

  constructor() { }

  searchMusaic(somePcs : IPcs[]) {
    this.eventSearchMatchMusaic.emit(somePcs)
  }

}
