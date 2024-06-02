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
    let inStorage : string[] =  JSON.parse(localStorage.getItem('the88.currentSelectedOp') || "['M1']");
    let res =
      inStorage.filter(value => ["M1", "M5", "M7", "M11", "CM1", "CM5", "CM7", "CM11"].includes(value))
    if (!res.includes("M1")) {
      res.push("M1")
    }
    return EightyEight.setOrderSelectedOp(res)
  }

  savePageThe88(selectedOp : string[]) {
    localStorage.setItem("the88.currentSelectedOp", JSON.stringify(selectedOp))
  }

}
