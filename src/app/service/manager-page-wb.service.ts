import {EventEmitter, Injectable, Output} from '@angular/core';
import {UIPcsDto} from "../ui/UIPcsDto";
import {ManagerLocalStorageService} from "./manager-local-storage.service";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";
import {Point} from "../utils/Point";

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

  DRAWERS: string[] = ["Musaic", "Clock"]

  pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[87].getPcsMin()
  pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[38].getPcsMin().complement().modalPrimeForm()
  pcs3 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[36].getPcsMin().complement().modalPrimeForm()

  uiPcsDtoList: UIPcsDto[] = [
    new UIPcsDto({pcs: this.pcs1, indexFormDrawer: 1, position: {x: 0, y: 0}}),
    new UIPcsDto({pcs: this.pcs2, indexFormDrawer: 1, position: {x: 110, y: 0}, isSelected: true}),
    new UIPcsDto({pcs: this.pcs3, indexFormDrawer: 1, position: {x: 220, y: 0}, isSelected: true})
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
    let DELTA_ZOOM = 20
    if (positif < 0) {
      DELTA_ZOOM *= -1
    }
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }

    let pcsDto = this.uiPcsDtoList[index]

    if (pcsDto.width + DELTA_ZOOM < this._MIN_WIDTH) {
      // already too small
      return
    }

    let size=  pcsDto.width + DELTA_ZOOM
    let n = pcsDto.pcs.nMapping //getMappedBinPcs().length;
    let CEL_WIDTH = Math.floor(size / (n + 1));

    // avoid that this.CEL_WIDTH * (n + 1) > width,
    // is not always case ! TODO generalize with nbCellsPer line/row - not n based
    // so CEL_WIDTH and CEL_HEIGHT
    if (CEL_WIDTH * (n + 1) > size) {
      CEL_WIDTH = CEL_WIDTH - 1
    }

    // adjust canvas size from CEL_WIDTH, for a better rendering,
    // even if FormDrawer is not MUSAIC
    let preferredSize = CEL_WIDTH * (n + 1)

    // if pcsDto.indexFormDrawer == CLOCK , then pcsDto.width or height impact pcsDto.uiClock.width or height
    let barycenter = this.getXYFromBarycenter(pcsDto)
    if (pcsDto.indexFormDrawer == UIPcsDto.MUSAIC) {
      pcsDto.uiMusaic.widthCell=CEL_WIDTH
    }
    pcsDto.height =  preferredSize
    pcsDto.width = preferredSize

    // Let's center the component
    pcsDto.position.x = barycenter.x - preferredSize/2
    pcsDto.position.y = barycenter.y - preferredSize/2

    this.uiPcsDtoList[index] = new UIPcsDto({
      ...pcsDto
    })
  }

  /**
   * Effect only is FormDrawer is Musaic (i.e musaic is shown rounded, not square)
   * @param index
   */
  toggleRounded(index: number) {
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }
    let pcsDto = this.uiPcsDtoList[index]
    if (pcsDto.indexFormDrawer === UIPcsDto.MUSAIC) {
      pcsDto.uiMusaic.rounded = !pcsDto.uiMusaic.rounded
    }
  }


  doUpdateDrawer(drawer: string, index: number) {
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error("oops bad index : " + index)
    }
    let pcsDto = this.uiPcsDtoList[index]
    let indexFormDrawer = this.DRAWERS.findIndex((d) => d == drawer)
    if (indexFormDrawer < 0) indexFormDrawer = 0

    let barycenter = this.getXYFromBarycenter(pcsDto)

    pcsDto.indexFormDrawer = indexFormDrawer

    pcsDto.position.x = barycenter.x - pcsDto.width/2
    pcsDto.position.y = barycenter.y - pcsDto.height/2

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

  /**
   * Clock is always square, his barycenter is p.x + p.width / 2
   * Musaic, centered on clock barycenter is p.barycenter.x - p.width
   * @param pcsDto
   * @private
   */
  private getXYFromBarycenter(pcsDto: UIPcsDto): Point {
    return new Point(
      pcsDto.position.x  + pcsDto.width/2,
      pcsDto.position.y  + pcsDto.height/2)

    // if (pcsDto.indexFormDrawer == UIPcsDto.MUSAIC) {
    //   return new Point(
    //     pcsDto.position.x  + pcsDto.uiClock.width/2 - pcsDto.uiMusaic.width/2,
    //     pcsDto.position.y  + pcsDto.uiClock.height/2 - pcsDto.uiMusaic.height/2)
    // } else {
    //   return new Point(pcsDto.position.x, pcsDto.position.y)
    //   // return pcsDto.position
    //
    // }
  }
}
