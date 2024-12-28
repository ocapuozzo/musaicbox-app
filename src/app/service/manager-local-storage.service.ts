import {inject, Injectable} from '@angular/core';
import {EightyEight} from "../utils/EightyEight";
import {UIPcsDto} from "../ui/UIPcsDto";
import {IPcs} from "../core/IPcs";
import {ClipboardService} from "./clipboard.service";
import {ManagerGroupActionService} from "./manager-group-action.service";
import {ManagerPcsService} from "./manager-pcs.service";
import {IStoragePage88} from "./IDataState";

export interface ISerializedPcs {
  strPcs: string
  iPivot ?: number
  nMapping: number
  templateMappingBinPcs ?: number[]
  groupName: string
}

@Injectable({
  providedIn: 'root'
})
export class ManagerLocalStorageService {
  private clipboard: ClipboardService<UIPcsDto[]> = inject(ClipboardService<UIPcsDto[]>)

  constructor() {
  }

  restorePageThe88(): IStoragePage88 {
    // get op selected with filter (hack)
    let inStorage: IStoragePage88
    try {
      // @ts-ignore
      inStorage = JSON.parse(localStorage.getItem('page88')) || {selectedOps: ['M1'], indexSelectedOctotrope: 0}
    } catch (e: any) {
      inStorage = {selectedOps: ['M1'], indexTab: 0, indexSelectedOctotrope: 0}
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
      indexTab: inStorage.indexTab % 3 || 0,
      indexSelectedOctotrope: inStorage.indexSelectedOctotrope % 13 || 0
    }
  }

  savePageThe88(data: IStoragePage88) {
    localStorage.setItem("page88", JSON.stringify(data))
  }

  /**
   * Make a new UIPcsDto[] list for storage, extended with serializedPcs properties
   * @param listPcsDto
   */
  makeSerialVersionPageWB(listPcsDto: UIPcsDto[]): UIPcsDto[] {
    let savListPcsDto: any[] = []
    listPcsDto.forEach(pcsDto => {
      let obj = {
        ...pcsDto,
        pcs: null, // pcs is no directly serialized (object complex in relationship)
        serializedPcs: {
          pcsStr: pcsDto.pcs.getPcsStr(),
          iPivot: pcsDto.pcs.iPivot,
          nMapping: pcsDto.pcs.nMapping,
          templateMappingBinPcs: pcsDto.pcs.templateMappingBinPcs,
          groupName: pcsDto.pcs.isDetached() ? '' : pcsDto.pcs.orbit!.groupAction!.group.name
        }
      }
      savListPcsDto.push(obj)
    })
    return savListPcsDto
  }

  savePageWB(listPcsDto: UIPcsDto[]) {
    localStorage.setItem("pageWB.currentContent", JSON.stringify(this.makeSerialVersionPageWB(listPcsDto)))
  }

  getSerialStringDataPcsDtoListPageWBFromLocalStorage(): string {
    return localStorage.getItem("pageWB.currentContent") || "[]"
  }

  getPcsDtoListFromLocalStoragePageWB(): UIPcsDto[] {
    return this.getPcsDtoListFromJsonContent(localStorage.getItem("pageWB.currentContent") || "[]")
  }

  getPcsDtoListFromJsonContent(contentJson: string): UIPcsDto[] {
    let listPcsDto: UIPcsDto[] = []
    try {
      let restoreListPcsDto: any[] = JSON.parse(contentJson || "[]") ?? []

      restoreListPcsDto.forEach(pcsSerialDto => {
        // update value (and type) of property 'pcs' from 'string' to 'instance of IPcs'
        let pcs: IPcs
        // get info via serializedPcs property
        const serializedPcs: ISerializedPcs = {
          strPcs: pcsSerialDto.serializedPcs.pcsStr,
          iPivot: pcsSerialDto.serializedPcs.iPivot,
          nMapping: pcsSerialDto.serializedPcs.nMapping ?? 12,
          templateMappingBinPcs: pcsSerialDto.serializedPcs.templateMappingBinPcs ?? [],
          groupName: pcsSerialDto.serializedPcs.groupName ?? ''
        }

        pcs = new IPcs({
          ...serializedPcs
        })

        // if group action, get pcs from it
        if (serializedPcs.groupName) {
          const groupAction =
            ManagerGroupActionService.getGroupActionFromGroupName(serializedPcs.groupName)
          if (groupAction) {
            const savPivot = pcs.getPivot()
            pcs = ManagerPcsService.makeNewInstanceOf(pcs, groupAction, savPivot);
          }
        }

        let pcsDto = new UIPcsDto({
          ...pcsSerialDto,
          pcs: pcs // set pcs object
        })
        listPcsDto.push(pcsDto)
      })
    } catch (e: any) {
      // nothing
    }

    return listPcsDto
  }

  copy(somePcsDto: UIPcsDto[]) {
    this.clipboard.copy(somePcsDto)

  }

  paste(): UIPcsDto[] {
    return this.clipboard.paste()
  }

  isEmptyClipboard() {
    return this.clipboard.isEmpty()
  }
}
