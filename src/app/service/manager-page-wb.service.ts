import {EventEmitter, Injectable, Output} from '@angular/core';
import {UIPcsDto} from "../ui/UIPcsDto";
import {ManagerLocalStorageService} from "./manager-local-storage.service";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";
import {Point} from "../utils/Point";
import {IPcs} from "../core/IPcs";
import {HistoryT} from "../utils/HistoryT";

export interface FinalElementMove {
  index: number,
  x: number,
  y: number
}

@Injectable({
  providedIn: 'root'
})
export class ManagerPageWBService {
  private readonly _MIN_WIDTH = 40;
  static deltaPositionNewPcs = 50;
  history: HistoryT<UIPcsDto[]>

  DRAWERS: string[] = ["Musaic", "Clock", "Score"]

  pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[87].getPcsMin()
  pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[38].getPcsMin().complement().modalPrimeForm()
  pcs3 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[36].getPcsMin().complement().modalPrimeForm()
  pcs4 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[36].getPcsMin().complement().modalPrimeForm()

  uiPcsDtoList: UIPcsDto[] = [
    new UIPcsDto({pcs: this.pcs1, indexFormDrawer: 1, position: {x: 0, y: 0}}),
    new UIPcsDto({pcs: this.pcs2, indexFormDrawer: 1, position: {x: 110, y: 0}, isSelected: true}),
    new UIPcsDto({pcs: this.pcs3, indexFormDrawer: 1, position: {x: 220, y: 0}, isSelected: true}),
    new UIPcsDto({pcs: this.pcs4, indexFormDrawer: 1, position: {x: 330, y: 0}, isSelected: true})
  ]

  @Output() eventChangePcsPdoList: EventEmitter<UIPcsDto[]> = new EventEmitter();

  constructor(private managerLocalStorageService: ManagerLocalStorageService) {
    this.history = new HistoryT<UIPcsDto[]>()
    this.history.pushInPresent(this.uiPcsDtoList)
  }

  emit() {
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  addPcs(somePcs: IPcs[]) {
    this.doUnselectAll()
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    somePcs.forEach(pcs => {
      const pcsDto =
        new UIPcsDto({
          pcs: pcs,
          indexFormDrawer: 1,
          position: {
            x: ManagerPageWBService.deltaPositionNewPcs += 10,
            y: ManagerPageWBService.deltaPositionNewPcs += 10
          },
          isSelected: true
        })
      this.uiPcsDtoList.push(pcsDto)
      if (ManagerPageWBService.deltaPositionNewPcs > window.innerWidth - 50) {
        ManagerPageWBService.deltaPositionNewPcs = 50
      }
    })

    this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }

  doZoom(direction: number, indexElementsToZoom: number[]) {
    let DELTA_ZOOM = 20 * direction

    this.uiPcsDtoList = [...this.uiPcsDtoList]

    indexElementsToZoom.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }

      let pcsDto =
        new UIPcsDto({...this.uiPcsDtoList[index]})

      if (pcsDto.width + DELTA_ZOOM < this._MIN_WIDTH) {
        // already too small
        return
      }

      let size = pcsDto.width + DELTA_ZOOM
      let n = pcsDto.pcs.nMapping //getMappedBinPcs().length;
      let CEL_WIDTH = Math.floor(size / (n + 1));

      // TODO generalize with nbCellsPer line/row - not n based

      // adjust canvas size from CEL_WIDTH, for a better rendering (no float)
      // even if FormDrawer is not MUSAIC
      let preferredSize = CEL_WIDTH * (n + 1)

      // if pcsDto.indexFormDrawer == CLOCK , then pcsDto.width or height
      // impact pcsDto.uiClock.width or height
      // put another way : pcsDto.width/height are polymorph
      let barycenterBeforeChangeSize = this.getXYFromBarycenter(pcsDto)

      if (pcsDto.indexFormDrawer == UIPcsDto.MUSAIC) {
        // real change widthCell
        pcsDto.uiMusaic.widthCell = CEL_WIDTH
      }

      if (pcsDto.indexFormDrawer == UIPcsDto.SCORE) {
        // TODO do better, in reaction of abcjs render
        if (pcsDto.pcs.cardinal > 4) {
          pcsDto.height = (preferredSize / 2 >= 88) ? (preferredSize / 2) : preferredSize / 1.5
        } else {
          pcsDto.height = preferredSize
        }
      } else {
        pcsDto.height = preferredSize
      }
      pcsDto.width = preferredSize

      // Let's center the component
      pcsDto.position = {
        x: barycenterBeforeChangeSize.x - pcsDto.width / 2,
        y: barycenterBeforeChangeSize.y - pcsDto.height / 2
      }

      this.uiPcsDtoList[index] = pcsDto

    })
    this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }


  /**
   * Effect only is FormDrawer is Musaic (i.e musaic is shown rounded, not square)
   * @param indexes list of this.uiPcsDtoList index
   */
  doToggleRounded(indexes: number[]) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      let pcsDto
        = new UIPcsDto({...this.uiPcsDtoList[index]})
      if (pcsDto.indexFormDrawer === UIPcsDto.MUSAIC) {
        pcsDto.uiMusaic.rounded = !pcsDto.uiMusaic.rounded
      }
      this.uiPcsDtoList[index] = pcsDto
    })
    this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }

  // TODO refactor avec liste indexes
  doUpdateDrawer(drawer: string, indexes: number[]) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }

      let pcsDto //= this.uiPcsDtoList[index]
        = new UIPcsDto({...this.uiPcsDtoList[index]})
      let indexFormDrawer = this.DRAWERS.findIndex((d) => d == drawer)
      if (indexFormDrawer < 0) indexFormDrawer = 0

      let barycenterBeforeChangeSize = this.getXYFromBarycenter(pcsDto)
      // rem : pcsDto.width and height are polymorph

      pcsDto.indexFormDrawer = indexFormDrawer

      pcsDto.position = {
        x: barycenterBeforeChangeSize.x - pcsDto.width / 2,
        y: barycenterBeforeChangeSize.y - pcsDto.height / 2
      }
      this.uiPcsDtoList[index] = pcsDto
    })

    this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }

  doFinalPosition(finalMoveElements: FinalElementMove[]) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    finalMoveElements.forEach(e => {
      if (e.index >= 0 && e.index < this.uiPcsDtoList.length) {
        let pcsDto
          = new UIPcsDto({...this.uiPcsDtoList[e.index]})
        pcsDto.position = {x: e.x, y: e.y}
        this.uiPcsDtoList[e.index] = pcsDto
      }
    })
    this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }

  doToggleSelected(index: number) {
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }
    this.uiPcsDtoList = [...this.uiPcsDtoList]

    let pcsDto
      = new UIPcsDto({...this.uiPcsDtoList[index]})

    pcsDto.isSelected = !pcsDto.isSelected
    this.uiPcsDtoList[index] = pcsDto
    // no historisation
    this.emit()
  }

  /**
   * Unselect all components from list of index (of this.uiPcsDtoList)
   * or all this.uiPcsDtoList if list index is empty
   * @param indexSelectedElements
   */
  doUnselectAll(indexSelectedElements: number[] = []) {
    // this.uiPcsDtoList = [...this.uiPcsDtoList]
    if (indexSelectedElements.length === 0) {

      this.uiPcsDtoList.forEach((e, index) => {
        if (e.isSelected) {
          let pcsDto
            = new UIPcsDto({...e})
          pcsDto.isSelected = false
          this.uiPcsDtoList[index] = pcsDto
        }
      })
    } else {
      indexSelectedElements.forEach(index => {
        let pcsDto
          = new UIPcsDto({...this.uiPcsDtoList[index]})
        pcsDto.isSelected = false
        this.uiPcsDtoList[index] = pcsDto
      })
    }
    // no historisation
    // this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }

  /**
   * Clock is always square, his barycenter is p.x + p.width / 2
   * Musaic, centered on clock barycenter is p.barycenter.x - p.width
   * @param pcsDto
   * @private
   */
  private getXYFromBarycenter(pcsDto: UIPcsDto): Point {
    return new Point(
      pcsDto.position.x + pcsDto.width / 2,
      pcsDto.position.y + pcsDto.height / 2)
  }


  doDuplicate(indexes: number[], deltaPosition = 20) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let newPcsDtos: UIPcsDto[] = []
    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      let pcsDto = this.uiPcsDtoList[index]

      let newPcsDto = new UIPcsDto({
        ...pcsDto, position: {x: pcsDto.position.x + deltaPosition, y: pcsDto.position.y + deltaPosition}, // do not share ref !
        isSelected: true
      })
      newPcsDtos.push(newPcsDto)
    })

    this.uiPcsDtoList.push(...newPcsDtos)
    this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }

  /**
   * Delete objects where their index is in indexToDeleteList
   * @param indexToDeleteList
   */
  doDelete(indexToDeleteList: number[]) {
    console.log("doDelete in wb service")
    this.uiPcsDtoList =
      this.uiPcsDtoList.filter((value, index) => !indexToDeleteList.includes(index))
    this.history.pushInPresent(this.uiPcsDtoList)
    this.emit()
  }

  unDoPcs() {
    // save also actual pcsList (parameter to unDoToPresent)
    let pcsDtoList = this.history.unDoToPresent()
    if (pcsDtoList != undefined) {
      this.uiPcsDtoList = pcsDtoList
      this.emit()
    }
  }

  reDoPcs() {
    let pcsDtoList = this.history.reDoToPresent()
    if (pcsDtoList != undefined) {
      this.uiPcsDtoList = pcsDtoList
      this.emit()
    }
  }

  canUndo(): boolean {
    return this.history.canUndo()
  }

  canRedo(): boolean {
    return this.history.canRedo()
  }

  getCurrentPcs(): UIPcsDto[] | undefined {
    return this.history.getCurrentPcs()
  }

}
