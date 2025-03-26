import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ManagerToolbarService {
  @Output() eventShowToolbar: EventEmitter<any> = new EventEmitter();

  isToolbarShown = true;

  constructor() { }

  toggleShowToolbar() {
    this.isToolbarShown = !this.isToolbarShown
    this.eventShowToolbar.emit(this.isToolbarShown);
  }
}
