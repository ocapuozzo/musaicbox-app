import { Injectable } from '@angular/core';
import {IOrbitMusaic} from "../page/the88/the88.component";

@Injectable({
  providedIn: 'root'
})
export class ManagerLocalStorageService {

  constructor() { }

  restorePageThe88() : string[] {
    return JSON.parse(localStorage.getItem('the88.currentSelectedOp') || '[]');
  }

  savePageThe88(selectedOp : string[]) {
    localStorage.setItem("the88.currentSelectedOp", JSON.stringify(selectedOp))
  }

}
