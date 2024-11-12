import {inject, Injectable} from '@angular/core';
import {EightyEight} from "../utils/EightyEight";
import {UIPcsDto} from "../ui/UIPcsDto";
import {IPcs} from "../core/IPcs";
import {ClipboardService} from "./clipboard.service";


export interface IStoragePage88 {
  selectedOps: string[]
  indexTab : number
  indexSelectedOctotrope : number

}

@Injectable({
  providedIn: 'root'
})
export class ManagerLocalStorageService {
  private clipboard : ClipboardService<UIPcsDto[]> = inject(ClipboardService<UIPcsDto[]>)

  constructor() {
  }

  restorePageThe88(): IStoragePage88 {
    // get op selected with filter (hack)
    let inStorage: IStoragePage88
    try {
      // @ts-ignore
      inStorage = JSON.parse(localStorage.getItem('page88')) || {selectedOps:['M1'], indexSelectedOctotrope:0}
    } catch (e: any) {
      inStorage =  {selectedOps:['M1'], indexTab:0, indexSelectedOctotrope:0}
    }

    let selectedOps = inStorage.selectedOps
    // don't trust the input data, just data in EightyEight.ORDERED_OPERATIONS_NAMES are accepted
    let operationsUserSelectedAndLocalStored =
      selectedOps.filter(value => EightyEight.ORDERED_OPERATIONS_NAMES.includes(value))

    // add "M1" if not includes (M1-TO is neutral operation)
    if (!operationsUserSelectedAndLocalStored.includes("M1")) {
      operationsUserSelectedAndLocalStored.push("M1")
    }

    return {
      selectedOps: EightyEight.sortToOrderedOperationsName(operationsUserSelectedAndLocalStored),
      indexTab : inStorage.indexTab || 0,
      indexSelectedOctotrope: inStorage.indexSelectedOctotrope || 0
    }
  }

  savePageThe88(data : IStoragePage88) {
    localStorage.setItem("page88", JSON.stringify(data))
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
