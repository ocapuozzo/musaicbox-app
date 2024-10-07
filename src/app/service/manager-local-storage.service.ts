import {inject, Injectable} from '@angular/core';
import {EightyEight} from "../utils/EightyEight";
import {UIPcsDto} from "../ui/UIPcsDto";
import {IPcs} from "../core/IPcs";
import {ClipboardService} from "./clipboard.service";

@Injectable({
  providedIn: 'root'
})
export class ManagerLocalStorageService {
  private clipboard : ClipboardService<UIPcsDto[]> = inject(ClipboardService<UIPcsDto[]>)

  constructor() {
  }

  restorePageThe88(): string[] {
    // get op selected with filter (hack)
    let inStorage: string[] = []
    try {
      // @ts-ignore
      inStorage = JSON.parse(localStorage.getItem('page88.currentSelectedOps')) || ["M1"]
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
    localStorage.setItem("page88.currentSelectedOps", JSON.stringify(selectedOp))
  }

  makeSerialVersion(listPcsDto: UIPcsDto[]) : UIPcsDto[] {
    let savListPcsDto: any[] = []
    listPcsDto.forEach(pcsDto => {
      let obj = {
        ...pcsDto,
        pcs: null, // pcs is no serialized (object complex in relationship)
        serializedPcs: {
          pcsStr: pcsDto.pcs.getPcsStr(),
          iPivot: pcsDto.pcs.iPivot,
          nMapping: pcsDto.pcs.nMapping,
          templateMappingBinPcs: pcsDto.pcs.templateMappingBinPcs
        }
      }
      savListPcsDto.push(obj)
    })
    return savListPcsDto
  }

  savePageWB(listPcsDto: UIPcsDto[]) {
    localStorage.setItem("pageWB.currentContent", JSON.stringify(this.makeSerialVersion(listPcsDto)))
  }

  getSerialStringDataPcsDtoListFromLocalStorage(): string {
    return localStorage.getItem("pageWB.currentContent") || "[]"
  }

  getPcsDtoListFromLocalStorage(): UIPcsDto[] {
    return this.getPcsDtoListFromJsonContent(localStorage.getItem("pageWB.currentContent") || "[]")
  }

  getPcsDtoListFromJsonContent(contentJson: string): UIPcsDto[] {
    let listPcsDto: UIPcsDto[] = []
    try {
      let restoreListPcsDto: any[] = JSON.parse(contentJson || "[]") ?? []

      restoreListPcsDto.forEach(pcsSerialDto => {
        // update value (and type) of property 'pcs' from 'string' to 'instance of IPcs'
        let pcs : IPcs
        if (typeof(pcsSerialDto.pcs) === 'string') {
          // for compatibility with first version (but pivot is lost, nMapping also...)
          pcs = new IPcs({strPcs: pcsSerialDto.pcs})
        } else { // an object
          // get info via serializedPcs property
          pcs = new IPcs({
            strPcs: pcsSerialDto.serializedPcs.pcsStr,
            iPivot:pcsSerialDto.serializedPcs.iPivot,
            nMapping:pcsSerialDto.serializedPcs.nMapping ?? 12,
            templateMappingBinPcs:pcsSerialDto.serializedPcs.templateMappingBinPcs ?? []
          })
          //console.log("pcs = ", pcs)
        }
        let pcsDto = new UIPcsDto({
          ...pcsSerialDto,
          pcs:pcs // set pcs object
        })
        listPcsDto.push(pcsDto)
      })
    } catch (e: any) {
      // nothing
    }

    return listPcsDto
  }

  copy(somePcsDto : UIPcsDto[]) {
    this.clipboard.copy(somePcsDto)

  }

  paste() : UIPcsDto[] {
    return this.clipboard.paste()
  }

  isEmptyClipboard() {
    return this.clipboard.isEmpty()
  }
}
