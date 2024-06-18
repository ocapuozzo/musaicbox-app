import {EventEmitter, Injectable, Output} from '@angular/core';
import {UIPcsDto} from "../ui/UIPcsDto";
import {ManagerLocalStorageService} from "./manager-local-storage.service";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";

export interface FinalElementMove {
  index: number,
  x: number,
  y: number
}

@Injectable({
  providedIn: 'root'
})
export class ManagerPageWBService {

  drawers: string[] = ["Musaic", "Clock"]

  pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[87].getPcsMin()
  pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[38].getPcsMin().complement().modalPrimeForm()
  pcs3 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[36].getPcsMin().complement().modalPrimeForm()

  uiPcsDtoList: UIPcsDto[] = [
    new UIPcsDto({pcs: this.pcs1, indexFormDrawer: 1, position: {x: 0, y: 0}}),
    new UIPcsDto({pcs: this.pcs2, indexFormDrawer: 1, position: {x: 100, y: 0}, isSelected: true}),
    new UIPcsDto({pcs: this.pcs3, indexFormDrawer: 1, position: {x: 200, y: 0}, isSelected: true})
  ]

  @Output() eventChangePcsPdoList: EventEmitter<UIPcsDto[]> = new EventEmitter();

  constructor(private managerLocalStorageService: ManagerLocalStorageService) {
  }

  add(pcsDto: UIPcsDto) {
    this.uiPcsDtoList.push(pcsDto)
    this.managerLocalStorageService.savePageWB(this.uiPcsDtoList)
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  delete(uiPcsDtoID: string) {
    this.uiPcsDtoList = this.uiPcsDtoList.filter(({id}) => id !== uiPcsDtoID);
    this.managerLocalStorageService.savePageWB(this.uiPcsDtoList)
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  update(uiPcsDtoID: string, pcsDtoUpdate: UIPcsDto) {
    this.uiPcsDtoList = this.uiPcsDtoList.map(pcsDto =>
      pcsDto.id === uiPcsDtoID
        ? new UIPcsDto({
          ...pcsDto,
          ...pcsDtoUpdate
        })
        : pcsDto
    );
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  refresh() {
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  doZoom(positif: number, index: number) {
    let delta = 20
    if (positif < 0) {
      delta *= -1
    }
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }
    let pcsDto = this.uiPcsDtoList[index]
    pcsDto.width = pcsDto.width + delta
    pcsDto.height = pcsDto.height + delta
    this.uiPcsDtoList[index] = new UIPcsDto({
      ...pcsDto
    })
  }

  toggleRounded(index: number) {
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }
    let pcsDto = this.uiPcsDtoList[index]
    pcsDto.uiMusaic.rounded = !pcsDto.uiMusaic.rounded
    // this.uiPcsDtoList[index] = new UIPcsDto({
    //   ...pcsDto
    // })
    // this.refresh()
  }


  doUpdateDrawer(drawer: string, index: number) {
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }
    let pcsDto = this.uiPcsDtoList[index]
    let indexFormDrawer = this.drawers.findIndex((d) => d == drawer)
    if (indexFormDrawer < 0) indexFormDrawer = 0
    pcsDto.indexFormDrawer = indexFormDrawer

    this.uiPcsDtoList[index] = new UIPcsDto({
      ...pcsDto
    })
  }

  doFinalPosition(finalMoveElements: FinalElementMove[]) {
    finalMoveElements.forEach(e => {
      if (e.index >= 0 && e.index < this.uiPcsDtoList.length) {
        let pcsDto = this.uiPcsDtoList[e.index]
        pcsDto.position.x = e.x
        pcsDto.position.y = e.y
      }
    })
  }

  doToggleSelected(index: number) {
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }

    let pcsDto = this.uiPcsDtoList[index]
    pcsDto.isSelected = !pcsDto.isSelected
  }

  /**
   * Unselect all components from list of index (of this.uiPcsDtoList)
   * @param indexSelectedElements
   */
  doUnselectAll(indexSelectedElements: number[]) {
    console.log("indexSelectedElements.length = ", indexSelectedElements.length)
    indexSelectedElements.forEach(index => {
      this.uiPcsDtoList[index].isSelected = false
      // this.uiPcsDtoList[index] = new UIPcsDto({
      //   ...this.uiPcsDtoList[index]
      // })
    })
  }
}
