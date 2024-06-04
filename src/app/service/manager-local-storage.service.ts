import { Injectable } from '@angular/core';
import {IOrbitMusaic} from "../page/the88/the88.component";
import {EightyEight} from "../utils/EightyEight";

@Injectable({
  providedIn: 'root'
})
export class ManagerLocalStorageService {

  constructor() { }

  restorePageThe88() : string[] {
    // get op selected with filter (hack)
    let inStorage : string[] = []
      try {
        // @ts-ignore
        inStorage = JSON.parse(localStorage.getItem('the88.currentSelectedOp')) || ["M1"]
      } catch (e: any) {
        // nothing
      }

    // don't trust the input data, just data in EightyEight.ORDERED_OPERATIONS_NAMES are accepted
    let operationsUserSelectedAndLocalStored =
      inStorage.filter(value => EightyEight.ORDERED_OPERATIONS_NAMES.includes(value))

    // add "M1" if not includes (M1-TO is neutral operation)
    if (!operationsUserSelectedAndLocalStored.includes("M1")) {
      operationsUserSelectedAndLocalStored.push("M1")
    }
    // sort
    return EightyEight.sortToOrderedOperationsName(operationsUserSelectedAndLocalStored)
  }

  savePageThe88(selectedOp : string[]) {
    localStorage.setItem("the88.currentSelectedOp", JSON.stringify(selectedOp))
  }

}
