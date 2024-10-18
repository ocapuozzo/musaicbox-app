import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";

export interface ISearchPcs {
  searchInput : string
  somePcs : IPcs[]
}


@Injectable({
  providedIn: 'root'
})
export class ManagerPageEightyHeightService {

  @Output() eventSearchMatchMusaic = new EventEmitter<ISearchPcs>();

  constructor() { }

  searchMusaic(searchData : ISearchPcs ) {
    this.eventSearchMatchMusaic.emit(searchData)
  }

}
