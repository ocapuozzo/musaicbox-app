import {EventEmitter, Injectable, Output, SecurityContext} from '@angular/core';
import {UIMusaic, UIPcsDto} from "../ui/UIPcsDto";
import {ManagerLocalStorageService} from "./manager-local-storage.service";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";
import {Point} from "../utils/Point";
import {IPcs} from "../core/IPcs";
import {HistoryT} from "../utils/HistoryT";
import {DialogSaveAsFileNameService} from "./dialog-save-as-file-name.service";
import {IDialogDataSaveToFile} from "../component/dialog-save-to-file/IDialogDataSaveToFile";
import {DomSanitizer} from "@angular/platform-browser";

export interface FinalElementMove {
  index: number,
  x: number,
  y: number
}

@Injectable({
  providedIn: 'root'
})
export class ManagerPageWBService {
  private readonly _MIN_WIDTH = 25;
  private readonly _GAP_BETWEEN = 13;
  static deltaPositionNewPcs = 20;

  history: HistoryT<UIPcsDto[]>

  DRAWERS: string[] = ["Musaic", "Clock", "Score"]

  /**
   * Array of pcsDto managed by whiteboard page
   */
  uiPcsDtoList: UIPcsDto[] = []

  /**
   * List of index element into this.uiPcsDtoList that user are selected
   * Use by align functions
   */
  orderedIndexesSelectedPcsDto: number[] = []

  /**
   * For format others as him
   * @private
   */
  pcsDtoForTemplate ?: UIPcsDto;

  /**
   * special attribut for save whiteboard content page to file
   */
  dataSaveToFile : IDialogDataSaveToFile = {
    fileName: 'my-muse-',
    withDateInFileName: true
  }

  @Output() eventChangePcsPdoList: EventEmitter<UIPcsDto[]> = new EventEmitter();

  constructor(private managerLocalStorageService: ManagerLocalStorageService,
              private dialogSaveAsFileNameService: DialogSaveAsFileNameService,
              private sanitizer: DomSanitizer) {

    this.dialogSaveAsFileNameService.eventFileNameSetByUser.subscribe((fileName) => {
      this.doSaveContentToFile(fileName)
    })

    this.history = new HistoryT<UIPcsDto[]>()

    let pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[58].getPcsMin()
    let pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[61].getPcsMin().complement().modalPrimeForm()
    let pcs3 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[55].getPcsMin().modalPrimeForm()
    let pcs4 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[26].getPcsMin().complement().modalPrimeForm()
    let uiMus = new UIMusaic({rounded: true})

    let pcsDtoList = [
      new UIPcsDto({pcs: pcs1, indexFormDrawer: 0, position: {x: 0, y: 10}}),
      new UIPcsDto({pcs: pcs2, indexFormDrawer: 1, position: {x: 110, y: 10}, isSelected: true}),
      new UIPcsDto({pcs: pcs3, indexFormDrawer: 2, position: {x: 220, y: 10}, isSelected: true}),
      new UIPcsDto({pcs: pcs4, indexFormDrawer: 0, position: {x: 400, y: 30}, uiMusaic: {...uiMus, width:35, height:35, widthCell:3} })
    ]
    let restorePcsDtoList = this.managerLocalStorageService.getPcsDtoListFromLocalStorage()
    this.uiPcsDtoList = restorePcsDtoList.length === 0 ? pcsDtoList : restorePcsDtoList
    // start with no selected element
    this.uiPcsDtoList.forEach( (pcsDto : UIPcsDto) => pcsDto.isSelected = false)
    this.orderedIndexesSelectedPcsDto = []

    this.history.pushIntoPresent(this.uiPcsDtoList)

  }

  emit() {
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  addPcs(somePcs: IPcs[], circularAlign : boolean = false ) {
    this.doUnselectAll()
    this.uiPcsDtoList = [...this.uiPcsDtoList]

    // avoid put outside screen
    if (somePcs.length > 10) ManagerPageWBService.deltaPositionNewPcs = 0

    somePcs.forEach(pcs => {
      let pcsDto =
        this.pcsDtoForTemplate
          ? new UIPcsDto({...this.pcsDtoForTemplate, uiMusaic:{...this.pcsDtoForTemplate.uiMusaic}})
          : new UIPcsDto()
      pcsDto.pcs = pcs
      ManagerPageWBService.deltaPositionNewPcs += this._GAP_BETWEEN
      pcsDto.position = {
        x: this.pcsDtoForTemplate ? this.pcsDtoForTemplate.position.x + ManagerPageWBService.deltaPositionNewPcs :
          ManagerPageWBService.deltaPositionNewPcs += 10,
        y: this.pcsDtoForTemplate ? this.pcsDtoForTemplate.position.y + ManagerPageWBService.deltaPositionNewPcs :
          ManagerPageWBService.deltaPositionNewPcs += 10,
      }
      pcsDto.isSelected = true
      this.uiPcsDtoList.push(pcsDto)
      if (ManagerPageWBService.deltaPositionNewPcs > window.innerWidth /2) {
        ManagerPageWBService.deltaPositionNewPcs = 20
      }

      // add index of last element
      this.orderedIndexesSelectedPcsDto.push(this.uiPcsDtoList.length - 1)
    }) // end for each
    if (circularAlign) {
      this.doCircularAlign()
    } else {
      this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
      this.emit()
    }
  }

  private readonly OFFSET_ZOOM = 13;


  /**
   *
   * @param direction if < 0 then zoom- else if positif then zoom+
   * @param indexElementsToZoom
   */
  doZoom(direction: number, indexElementsToZoom: number[] = []) {

    let DELTA_ZOOM = this.OFFSET_ZOOM * direction // positive or negative

    this.uiPcsDtoList = [...this.uiPcsDtoList]

    // by default zoom on all selected elements
    if (indexElementsToZoom.length === 0) {
      indexElementsToZoom = this.orderedIndexesSelectedPcsDto
    }

    let listChanged = false
    indexElementsToZoom.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }

      let pcsDto =
        new UIPcsDto({...this.uiPcsDtoList[index]})

      let size = pcsDto.width + DELTA_ZOOM
      let n = pcsDto.pcs.nMapping //getMappedBinPcs().length;

      // adjust canvas size from CEL_WIDTH, for a better rendering (no float)
      // even if FormDrawer is not MUSAIC
      let cellWith = Math.floor(size / (n + 1));
      // TODO generalize with nbCellsPer line/row - not n based

      let preferredSize = cellWith * (n + 1)

      // too small ?
      if (preferredSize >= this._MIN_WIDTH) {

        // if pcsDto.indexFormDrawer === CLOCK , then pcsDto.width or height
        // impact pcsDto.uiClock.width or height
        // put another way : pcsDto.width/height are polymorph
        let barycenterBeforeChangeSize = this.getXYFromBarycenter(pcsDto)

        if (pcsDto.indexFormDrawer === UIPcsDto.MUSAIC) {
          // real change widthCell
          pcsDto.uiMusaic.widthCell = cellWith
        }

        if (pcsDto.indexFormDrawer === UIPcsDto.SCORE) {
          // TODO do better, in reaction of abcjs render
          if (pcsDto.pcs.cardinal >= 4) {
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
        listChanged = true
        this.uiPcsDtoList[index] = pcsDto
      }
    })
    if (listChanged) {
      this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
      this.emit()
    }
  }

  /**
   * Effect only is FormDrawer is Musaic (i.e musaic is shown rounded, not square)
   *
   * @param indexes list of this.uiPcsDtoList index
   * @param valueRounded
   */
  doSetRounded(indexes: number[], valueRounded: boolean) {
    // doToggleRounded(indexes: number[]) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      let pcsDto
        = new UIPcsDto({...this.uiPcsDtoList[index]})
      if (pcsDto.indexFormDrawer === UIPcsDto.MUSAIC) {
        pcsDto.uiMusaic.rounded = valueRounded //!pcsDto.uiMusaic.rounded
      }
      this.uiPcsDtoList[index] = pcsDto
    })
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doUpdateDrawer(drawer: string, indexes: number[] = []) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]

    if (indexes.length === 0) {
      indexes = this.orderedIndexesSelectedPcsDto
    }

    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }

      let pcsDto //= this.uiPcsDtoList[index]
        = new UIPcsDto({...this.uiPcsDtoList[index]})
      let indexFormDrawer = this.DRAWERS.findIndex((d) => d === drawer)
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

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
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
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
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

    // update orderedIndexesSelectedPcsDto
    if (pcsDto.isSelected) {
      this.orderedIndexesSelectedPcsDto.push(index)
    } else {
      const iDelete = this.orderedIndexesSelectedPcsDto.indexOf(index)
      if (iDelete >= 0) {
        this.orderedIndexesSelectedPcsDto.splice(iDelete, 1)
      }
    }
    // no historisation
    this.emit()
  }

  /**
   * Unselect all components from list of index (of this.uiPcsDtoList)
   * or all this.uiPcsDtoList if list index is empty
   * @param indexSelectedElements
   */
  doUnselectAll(indexSelectedElements: number[] = []) {
    if (indexSelectedElements.length === 0) {

      this.uiPcsDtoList.forEach((e, index) => {
        if (e.isSelected) {
          let pcsDto
            = new UIPcsDto({...e})
          pcsDto.isSelected = false
          this.uiPcsDtoList[index] = pcsDto
        }
      })
      // no more selected index
      this.orderedIndexesSelectedPcsDto = []
    } else {
      indexSelectedElements.forEach(index => {
        let pcsDto
          = new UIPcsDto({...this.uiPcsDtoList[index]})
        pcsDto.isSelected = false
        this.uiPcsDtoList[index] = pcsDto

        // update list of index pcs selected
        const iDelete = this.orderedIndexesSelectedPcsDto.indexOf(index)
        if (iDelete >= 0) {
          this.orderedIndexesSelectedPcsDto.splice(iDelete, 1)
        }

      })
    }
    // no historisation
    this.emit()
  }

  doSelectAll() {
    this.uiPcsDtoList.forEach((e, index) => {
      if (!e.isSelected) {
        let pcsDto
          = new UIPcsDto({...e})
        pcsDto.isSelected = true
        this.uiPcsDtoList[index] = pcsDto

        // update this.orderedIndexesSelectedPcsDto
        // normally index is not in orderedIndexesSelectedPcsDto
        if (!this.orderedIndexesSelectedPcsDto.includes(index)) {
          this.orderedIndexesSelectedPcsDto.push(index)
        } else {
          new Error(`${index} will not be into ${this.orderedIndexesSelectedPcsDto}`)
        }
      }
    })
  }

  /**
   *
   * @param pcsDto
   * @private
   */
  private getXYFromBarycenter(pcsDto: UIPcsDto): Point {
    return new Point(
      pcsDto.position.x + pcsDto.width / 2,
      pcsDto.position.y + pcsDto.height / 2)
  }


  doDuplicate(index: number, deltaPosition = 20) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let newPcsDtos: UIPcsDto[] = []
    let indexes : number[] = []

    if (this.isIndexInElementSelected(index)) {
      // do on all selected elements
      indexes = this.orderedIndexesSelectedPcsDto
    } else {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      // do only for this one
      indexes = [index]
    }

    indexes.forEach(index => {

      let pcsDto = this.uiPcsDtoList[index]

      let newPcsDto = new UIPcsDto({
        ...pcsDto, position: {x: pcsDto.position.x + deltaPosition, y: pcsDto.position.y + deltaPosition}, // do not share ref !
        isSelected: true
      })
      // console.log(newPcsDto)
      newPcsDtos.push(newPcsDto)
    })
    this.doUnselectAll()
    this.uiPcsDtoList.push(...newPcsDtos)
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doToggleShowChordName(index: number) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let indexes : number[]

    if (this.isIndexInElementSelected(index)) {
      // do on all selected elements
      indexes = this.orderedIndexesSelectedPcsDto
    } else {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      // do only for this one
      indexes = [index]
    }

    // work with value of element target event
    const valueShowChordName = ! this.uiPcsDtoList[index].showChordName

    indexes.forEach(index => {
      let pcsDto = this.uiPcsDtoList[index]
      this.uiPcsDtoList[index] = new UIPcsDto({
        ...pcsDto,
        showChordName: valueShowChordName
      })
    })

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  /**
   * Delete objects where their index is in indexToDeleteList
   * @param indexToDeleteList
   */
  doDelete(indexToDeleteList: number[]) {
    this.uiPcsDtoList =
      this.uiPcsDtoList.filter((value, index) => !indexToDeleteList.includes(index))
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  unDoPcsDtoList() {
    if (this.canUndo()) {
      // save also actual pcsList (parameter to unDoToPresent)
      let pcsDtoList = this.history.unDoToPresent()
      if (pcsDtoList != undefined) {
        this.uiPcsDtoList = pcsDtoList
        this.doUnselectAll()
        this.managerLocalStorageService.savePageWB(this.uiPcsDtoList)
        this.emit()
      }
    }
  }

  reDoPcsDtoList() {
    if (this.canRedo()) {
      let pcsDtoList = this.history.reDoToPresent()
      if (pcsDtoList != undefined) {
        this.uiPcsDtoList = pcsDtoList
        this.managerLocalStorageService.savePageWB(this.uiPcsDtoList)
        this.emit()
      }
    }
  }

  canUndo(): boolean {
    return this.history.canUndo()
  }

  canRedo(): boolean {
    return this.history.canRedo()
  }

  getCurrent(): UIPcsDto[] | undefined {
    return this.history.getCurrent()
  }

  setPcsDtoForTemplate(pcsDto: UIPcsDto) {
    this.pcsDtoForTemplate = pcsDto
  }

  /**
   * Align selected elements on same "column" (vertically)
   */
  doVerticalAlign() {
    const selectedPcsIndexes = this.getSelectedPcsDtoIndexes()

    if (selectedPcsIndexes.length < 2) return // already align :))

    let avgX = 0
    let sumHeight = 0
    let avgY = 0

    selectedPcsIndexes.forEach(index => {
      avgX += this.uiPcsDtoList[index].position.x + this.uiPcsDtoList[index].width / 2
      avgY += this.uiPcsDtoList[index].position.y + this._GAP_BETWEEN
      sumHeight += this.uiPcsDtoList[index].height + this._GAP_BETWEEN
    })

    sumHeight -= this._GAP_BETWEEN
    avgY -= this._GAP_BETWEEN
    avgX = avgX / selectedPcsIndexes.length
    avgY = avgY / selectedPcsIndexes.length

    let originY = avgY - (sumHeight / 2) + this._GAP_BETWEEN

    let finalMoveElements: FinalElementMove[] = []

    // get origin Y for first position
    let startY = originY

    selectedPcsIndexes.forEach(index => {
      finalMoveElements.push(
        {
          index: index,
          x: avgX - this.uiPcsDtoList[index].width / 2, // center align
          y: startY
        }
      )
      // compute next y
      startY += this.uiPcsDtoList[index].height + this._GAP_BETWEEN
    })

    this.doFinalPosition(finalMoveElements)
  }

  doHorizontalAlign() {
    const selectedPcsIndexes = this.getSelectedPcsDtoIndexes()

    if (selectedPcsIndexes.length < 2) return // already align :))

    let avgY = 0
    let avgX = 0
    let sumWidth = 0

    selectedPcsIndexes.forEach(index => {
      avgY += this.uiPcsDtoList[index].position.y + this.uiPcsDtoList[index].height / 2
      avgX += this.uiPcsDtoList[index].position.x + this._GAP_BETWEEN
      sumWidth += this.uiPcsDtoList[index].width + this._GAP_BETWEEN
    })
    avgX -= this._GAP_BETWEEN
    sumWidth -= this._GAP_BETWEEN

    avgY = avgY / selectedPcsIndexes.length
    avgX = avgX / selectedPcsIndexes.length

    let originX = avgX - (sumWidth / 2) + this._GAP_BETWEEN

    let finalMoveElements: FinalElementMove[] = []
    let x = originX
    selectedPcsIndexes.forEach(index => {
      finalMoveElements.push(
        {
          index: index,
          x: x,
          y: avgY - this.uiPcsDtoList[index].height / 2, // center align
        }
      )
      x += this.uiPcsDtoList[index].width + this._GAP_BETWEEN
    })
    this.doFinalPosition(finalMoveElements)
  }

  /**
   * Prefer use getSelectedPcsDtoIndexes because they are ordered by user
   * @private
   */
  private getSelectedPcsDto() {
    return this.uiPcsDtoList.filter(pcsDto => pcsDto.isSelected)
  }

  private getSelectedPcsDtoIndexes(): number[] {
    return this.orderedIndexesSelectedPcsDto
    // return this.uiPcsDtoList.map((pcsDto, index) => pcsDto.isSelected ? index : -1)
    //   .filter(index => index >= 0)
  }

  doCircularAlign() {
    const selectedPcsIndexes = this.getSelectedPcsDtoIndexes()
    if (selectedPcsIndexes.length < 2) return // already align :))

    let finalMoveElements: FinalElementMove[] = []

    // compute barycenter
    let barycenter = new Point(0, 0)
    let point = new Point(0, 0)
    let radius = 0
    selectedPcsIndexes.forEach(index => {
      point.x += this.uiPcsDtoList[index].position.x + this.uiPcsDtoList[index].width / 2
      point.y += this.uiPcsDtoList[index].position.y + this.uiPcsDtoList[index].height / 2
      radius += this.uiPcsDtoList[index].width
    })
    // barycenter point
    barycenter.x = point.x / selectedPcsIndexes.length
    barycenter.y = point.y / selectedPcsIndexes.length

    // radius increase with number of selected elements.
    // Dividing it by four seems like a good choice, a good number (?)
    // rem : if selectedPcsIndexes.length == 4, radius is avg width
    radius /= selectedPcsIndexes.length > 10 ? 5 : 4

    // dont hide elements (left and top) TODO right and bottom ?
    if (barycenter.x - radius < 0) barycenter.x += radius
    if (barycenter.y - radius < 0) barycenter.y += radius

    let ang = 3 * Math.PI / 2;
    selectedPcsIndexes.forEach(index => {
      let x = barycenter.x + Math.round(Math.cos(ang) * radius);
      let y = barycenter.y + Math.round(Math.sin(ang) * radius);
      finalMoveElements.push(
        {
          index: index,
          x: x - this.uiPcsDtoList[index].width / 2, // center align
          y: y - this.uiPcsDtoList[index].height / 2
        }
      )
      ang = ang + 2 * Math.PI / selectedPcsIndexes.length;
    })
    this.doFinalPosition(finalMoveElements)
  }

  private pushPcsDtoListToHistoryAndSaveToLocalStorage() {
    this.history.pushIntoPresent(this.uiPcsDtoList)
    this.managerLocalStorageService.savePageWB(this.uiPcsDtoList)
  }

  doReplaceContentBy(contentJson: string) {
    this.uiPcsDtoList = this.managerLocalStorageService.getPcsDtoListFromJsonContent(contentJson)
    // start with no selected element
    this.uiPcsDtoList.forEach( (pcsDto : UIPcsDto) => pcsDto.isSelected = false)
    this.orderedIndexesSelectedPcsDto = []
    // this.orderedIndexesSelectedPcsDto =
    //   this.uiPcsDtoList
    //     .map((pcsDto, index) => pcsDto.isSelected ? index : -1)
    //     .filter(index => index >= 0)
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  getSerialDataContent() {
    return this.managerLocalStorageService.getSerialDataPcsDtoListFromLocalStorage();
  }

  /**
   * Return true if index param is into the list of indexes selected
   * @param index
   */
  isIndexInElementSelected(index: number) {
    return this.orderedIndexesSelectedPcsDto.includes(index);
  }

  doSaveContentToFile(fileName : string = "my-project.musaicbox") {
     // console.log(`Save content to ${fileName}`)
      const blob = new Blob([this.getSerialDataContent()], {type: 'application/json'});
      const url = window.URL.createObjectURL(blob);
      let anchor = document.createElement("a");
      anchor.download = fileName;
      // https://stackoverflow.com/questions/55849415/type-saferesourceurl-is-not-assignable-to-type-string
      anchor.href = "" + this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(url));
      anchor.click();
    }

  doOpenDialogAndSaveContentToFile() {
    this.dialogSaveAsFileNameService.openDialogForSaveIntoFile(this.dataSaveToFile)
  }

  doDuplicateInOthersView(index: number) {
    const pcsDto = this.uiPcsDtoList[index]
    let newPcsDto : UIPcsDto[] = []
    this.DRAWERS.forEach((drawer, index) => {
       if (index != pcsDto.indexFormDrawer) {
         newPcsDto.push(new UIPcsDto({
           ...pcsDto,
           indexFormDrawer: index,
           isSelected:true,
           uiMusaic: new UIMusaic({...pcsDto.uiMusaic, rounded:true })
         }))
       }
    })
    this.uiPcsDtoList = [...this.uiPcsDtoList, ...newPcsDto]

    this.orderedIndexesSelectedPcsDto.forEach(index => {
      this.uiPcsDtoList[index].isSelected = false
    })

    this.uiPcsDtoList[index].isSelected = true
    this.orderedIndexesSelectedPcsDto = []

    this.orderedIndexesSelectedPcsDto.push(index)
    //start to one (because already pcsDto is in place)
    for (let i = 1; i < this.DRAWERS.length; i++) {
      // add last indexes
      this.orderedIndexesSelectedPcsDto.push(this.uiPcsDtoList.length-i)
    }
    this.doCircularAlign()
  }
}
