import {Injectable} from '@angular/core';
import {IOrbitMusaic} from "../page/the88/the88.component";
import {EightyEight} from "../utils/EightyEight";
import {UIPcsDto} from "../ui/UIPcsDto";
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerLocalStorageService {

  constructor() {
  }

  restorePageThe88(): string[] {
    // get op selected with filter (hack)
    let inStorage: string[] = []
    try {
      // @ts-ignore
      inStorage = JSON.parse(localStorage.getItem('page88.currentSelectedOp')) || ["M1"]
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

  savePageThe88(selectedOp: string[]) {
    localStorage.setItem("page88.currentSelectedOp", JSON.stringify(selectedOp))
  }

  savePageWB(listPcsDto: UIPcsDto[]) {
    let savListPcsDto: any[] = []
    listPcsDto.forEach(pcsDto => {
      let obj = {
        ...pcsDto,
        isSelected: false,
        pcs: pcsDto.pcs.getPcsStr()  // simple serial pcs (string)
      }
      savListPcsDto.push(obj)
    })

    localStorage.setItem("pageWB.currentContent", JSON.stringify(savListPcsDto))
  }

  getSerialDataPcsDtoListFromLocalStorage(): string {
    return localStorage.getItem("pageWB.currentContent") || "[]"
  }

  getPcsDtoListFromLocalStorage(): UIPcsDto[] {
    return this.getPcsDtoListFromJsonContent(localStorage.getItem("pageWB.currentContent") || "[]")
  }

  getPcsDtoListFromJsonContent(contentJson: string): UIPcsDto[] {
    let listPcsDto: UIPcsDto[] = []
    try {
      // @ts-ignore
      let restoreListPcsDto: any[] = JSON.parse(contentJson || "[]")

      // update value (and type) of attribut 'pcs' from 'pcs string' to 'instance of IPcs'
      restoreListPcsDto.forEach(pcsDto => {
        let obj = new UIPcsDto({
          ...pcsDto,
          pcs: new IPcs({strPcs: pcsDto.pcs})
        })
        listPcsDto.push(obj)
      })

    } catch (e: any) {
      // nothing
    }

    return listPcsDto
  }


}
