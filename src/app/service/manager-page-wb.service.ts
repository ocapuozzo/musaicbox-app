import {EventEmitter, Injectable, Output, SecurityContext} from '@angular/core';
import {TDrawerName, UIMusaic, UIPcsDto} from "../ui/UIPcsDto";
import {ManagerLocalStorageService} from "./manager-local-storage.service";
import {Point} from "../utils/Point";
import {IPcs, TDirection} from "../core/IPcs";
import {HistoryT} from "../utils/HistoryT";
import {DialogSaveAsFileNameService} from "./dialog-save-as-file-name.service";
import {IDialogDataSaveToFile} from "../component/dialog-save-to-file/IDialogDataSaveToFile";
import {DomSanitizer} from "@angular/platform-browser";
import {DialogUpdateFreeTextService} from "./dialog-update-free-text.service";
import {IDialogDataSaveFreeText} from "../component/dialog-free-text/IDialogDataSaveFreeText";
import {ManagerPcsService} from "./manager-pcs.service";
import {ManagerGroupActionService} from "./manager-group-action.service";

export interface FinalElementMove {
  index: number,
  x: number,
  y: number
}

// type TPrimeForm = 'Modal' | 'Cyclic' | 'Dihedral' | 'Affine' | 'Musaic'
export const LiteralPrimeForms = ['Modal', 'Cyclic', 'Dihedral', 'Affine', 'Musaic'] as const;
export type TPrimeForm = typeof LiteralPrimeForms[number];

export type TZoomDirection = -1 | 1
export type TColorProperty = "PitchColorON" | "PitchColorOFF" | "PolygonColor"

@Injectable({
  providedIn: 'root'
})
export class ManagerPageWBService {
  private readonly _MIN_WIDTH = 25;
  private readonly _GAP_BETWEEN = 13;
  static deltaPositionNewPcs = 20;

  history: HistoryT<UIPcsDto[]>

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
  dataSaveToFile: IDialogDataSaveToFile = {
    fileName: 'my-muse-',
    withDateInFileName: true
  }

  private userAskClearContentAfterSave = false

  @Output() eventChangePcsPdoList: EventEmitter<UIPcsDto[]> = new EventEmitter();


  constructor(private managerLocalStorageService: ManagerLocalStorageService,
              private dialogSaveAsFileNameService: DialogSaveAsFileNameService,
              private dialogUpdateFreeTextService: DialogUpdateFreeTextService,
              private managerPcsService: ManagerPcsService,
              private sanitizer: DomSanitizer) {

    this.dialogSaveAsFileNameService.eventFileNameSetByUser.subscribe((fileName) => {
      this.doSaveContentToFile(fileName)
      if (this.userAskClearContentAfterSave) {
        this.userAskClearContentAfterSave = false
        this.doClearContentSaveAndEmit()
        // console.log("Clear content after save")
      }
    })

    this.dialogUpdateFreeTextService.eventUpdateFreeText.subscribe((data: IDialogDataSaveFreeText) => {
      this.doUpdateFreeText(data)
    })

    this.history = new HistoryT<UIPcsDto[]>()
    let initialPcsDtoList = this.makeInitialPcsDtoList();
    let restorePcsDtoList = this.managerLocalStorageService.getPcsDtoListFromLocalStoragePageWB()
    this.uiPcsDtoList = restorePcsDtoList.length === 0 ? initialPcsDtoList : restorePcsDtoList
    // start with no selected element
    this.uiPcsDtoList.forEach((pcsDto: UIPcsDto) => pcsDto.isSelected = false)
    this.orderedIndexesSelectedPcsDto = []
    if (restorePcsDtoList === initialPcsDtoList) {
      this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    } else {
      this.history.pushIntoPresent(this.uiPcsDtoList)
    }
  }

  private makeInitialPcsDtoList() {
    const musaicGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    let pcs1 = musaicGroup.orbits[58].getPcsMin()
    let pcs2 = musaicGroup.orbits[61].getPcsMin().complement().symmetryPrimeForm()
    let pcs3 = musaicGroup.orbits[55].getPcsMin().symmetryPrimeForm()
    let pcs4 = musaicGroup.orbits[26].getPcsMin().complement().symmetryPrimeForm()
    let uiMus = new UIMusaic({rounded: true})

    return [
      new UIPcsDto({pcs: pcs1, indexFormDrawer: 0, position: {x: 0, y: 10}}),
      new UIPcsDto({pcs: pcs2, indexFormDrawer: 1, position: {x: 110, y: 10}, isSelected: true}),
      new UIPcsDto({pcs: pcs3, indexFormDrawer: 2, position: {x: 220, y: 10}, isSelected: true}),
      new UIPcsDto({
        freeText: {text: pcs4.getPcsStr(), width: 88, height: 25, fontSize: "12px"},
        pcs: pcs4,
        indexFormDrawer: 42,
        position: {x: 400, y: 30},
        uiMusaic: {...uiMus, width: 35, height: 35, widthCell: 3}
      })
    ]
  }

  emit() {
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  addPcs({somePcs, circularAlign, indexCenterElement, templateDto}: {
    somePcs: IPcs[],
    circularAlign?: boolean,
    indexCenterElement?: number,
    templateDto?: UIPcsDto
  }) {
    circularAlign = circularAlign ?? false
    indexCenterElement = indexCenterElement ?? undefined
    templateDto = templateDto ?? undefined
    // console.log(`circular : ${circularAlign},  indexcenter : ${indexCenterElement}`)
    this.doUnselectAll(false)
    const selectedIndexPcs: number[] = []

    this.uiPcsDtoList = [...this.uiPcsDtoList]

    // avoid put outside screen
    if (somePcs.length > 10 && !circularAlign) ManagerPageWBService.deltaPositionNewPcs = 0

    if (indexCenterElement && !isNaN(indexCenterElement) && !templateDto) {
      // use it for template ui
      // this.pcsDtoForTemplate = this.uiPcsDtoList[indexCenterElement]
      templateDto = this.uiPcsDtoList[indexCenterElement]

      // console.log("clock width = ", this.pcsDtoForTemplate.uiClock.width)
    }
    if (!templateDto) {
      templateDto = this.pcsDtoForTemplate
    }
    somePcs.forEach(pcs => {
      let pcsDto =
        templateDto !== undefined
          ? new UIPcsDto({
            ...templateDto,
            pcs: pcs,

            freeText: undefined,
          })
          : new UIPcsDto({pcs: pcs})

      // uiMusaic: {...this.pcsDtoForTemplate.uiMusaic},
      pcsDto.uiMusaic.rounded = pcsDto.uiMusaic.rounded || pcs.isComingFromAnOrbit()

      if (!circularAlign) {
        ManagerPageWBService.deltaPositionNewPcs += this._GAP_BETWEEN
      }

      pcsDto.position = {
        x: templateDto
          ? templateDto.position.x + (circularAlign ? 0 : ManagerPageWBService.deltaPositionNewPcs)
          : ManagerPageWBService.deltaPositionNewPcs += 10,
        y: templateDto
          ? templateDto.position.y + (circularAlign ? 0 : ManagerPageWBService.deltaPositionNewPcs)
          : ManagerPageWBService.deltaPositionNewPcs += 10,
      }

      // for ui
      pcsDto.isSelected = true

      this.uiPcsDtoList.push(pcsDto)
      if (!circularAlign) {
        if (ManagerPageWBService.deltaPositionNewPcs > window.innerWidth / 2) {
          ManagerPageWBService.deltaPositionNewPcs = 20
        }
      }
      const indexLastElement = this.uiPcsDtoList.length - 1
      // add new index to selected index list (they will be selected in fine)
      this.orderedIndexesSelectedPcsDto.push(indexLastElement)
      // add new index to local selected index list for circular placement in UI
      selectedIndexPcs.push(indexLastElement)
    }) // end for each

    // pcs with index = indexCenterElement will be selected also (with others new pcs)
    // TODO : is it a good idea ? (see whiteboard doMakeModeOrbit)
    if (circularAlign && indexCenterElement) {
      this.orderedIndexesSelectedPcsDto.push(indexCenterElement)
      this.uiPcsDtoList[indexCenterElement].isSelected = true
    }

    if (circularAlign) {
      this.doCircularAlign(selectedIndexPcs, indexCenterElement)
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
  doZoom(direction: TZoomDirection, indexElementsToZoom: number[] = []): void | Error {

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
      let n = pcsDto.pcs.nMapping //getMappedVectorPcs().length;

      // adjust canvas size from CEL_WIDTH, for a better rendering (no float)
      // even if FormDrawer is not MUSAIC
      let cellWith = Math.floor(size / (n + 1));
      // TODO generalize with nbCellsPer line/row - not n based

      let preferredSize = cellWith * (n + 1)

      // too small ?

      while (preferredSize < this._MIN_WIDTH) {
        preferredSize = ++cellWith * (n + 1)
      }
      // if (preferredSize < this._MIN_WIDTH) preferredSize = this._MIN_WIDTH


      // if pcsDto.indexFormDrawer === UIPcsDto.CLOCK, then pcsDto.width or height
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
          pcsDto.height = preferredSize > 100 ? preferredSize / 1.5 : preferredSize
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

    })
    if (listChanged) {
      this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
      this.emit()
    }
  }

  /**
   * Effect only is FormDrawer is Musaic (i.e musaic is shown rounded, not square)
   *
   * @param valueRounded new boolean value
   * @param indexes list of this.uiPcsDtoList index
   */
  doSetRounded(valueRounded: boolean, indexes: number[] = []) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]

    if (indexes.length === 0) {
      indexes = this.orderedIndexesSelectedPcsDto
    }

    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      if (this.uiPcsDtoList[index].indexFormDrawer === UIPcsDto.MUSAIC &&
        this.uiPcsDtoList[index].uiMusaic.rounded !== valueRounded) {
        let pcsDto
          = new UIPcsDto({...this.uiPcsDtoList[index]})
        pcsDto.uiMusaic.rounded = valueRounded
        this.uiPcsDtoList[index] = pcsDto
      }
    })
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doUpdateDrawer(drawer: TDrawerName, indexes: number[] = []) {
    const updatedThisUiPcsDtoList = [...this.uiPcsDtoList]

    if (indexes.length === 0) {
      indexes = this.orderedIndexesSelectedPcsDto
    }

    // let newIndexFormDrawer = this.DRAWERS.findIndex((d) => d === drawer)
    let newIndexFormDrawer = UIPcsDto.ALL_DRAWERS.get(drawer)
    if (newIndexFormDrawer === undefined) newIndexFormDrawer = 0

    let updated = false
    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }

      if (this.uiPcsDtoList[index].indexFormDrawer !== newIndexFormDrawer) {
        updated = true
        let pcsDto //= this.uiPcsDtoList[index]
          = new UIPcsDto({...this.uiPcsDtoList[index]})

        let barycenterBeforeChangeSize = this.getXYFromBarycenter(pcsDto)
        // rem : pcsDto.width and height are polymorph

        pcsDto.indexFormDrawer = newIndexFormDrawer

        pcsDto.position = {
          x: barycenterBeforeChangeSize.x - pcsDto.width / 2,
          y: barycenterBeforeChangeSize.y - pcsDto.height / 2
        }
        // this.uiPcsDtoList[index] = pcsDto
        updatedThisUiPcsDtoList[index] = pcsDto
      }

    })

   if (updated) {
     this.uiPcsDtoList = updatedThisUiPcsDtoList
     this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
     this.emit()
   }
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
   * Unselect all components
   */
  doUnselectAll(emit: boolean = true) {
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

    // no historisation
    if (emit) {
      this.emit()
    }
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


  doDuplicate(index: number, complement: boolean = false) {
    const deltaPosition = 20
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let newPcsDtos: UIPcsDto[] = []

    let indexes = this.getIndexesTarget(index);

    this.doUnselectAll(false)

    indexes.forEach(index => {

      let pcsDto = this.uiPcsDtoList[index]

      let newPcsDto = new UIPcsDto({
        ...pcsDto, position: {x: pcsDto.position.x + deltaPosition, y: pcsDto.position.y + deltaPosition}, // do not share ref !
        isSelected: true,
        pcs: complement ? this.managerPcsService.complement(pcsDto.pcs) : pcsDto.pcs // readonly, pcs can be shared
      })
      newPcsDtos.push(newPcsDto)
      // because previous call doUnselectAll(), we add now new index in ordered selection index
      this.orderedIndexesSelectedPcsDto.push(this.uiPcsDtoList.length - 1 + newPcsDtos.length)
    })

    this.uiPcsDtoList.push(...newPcsDtos) //
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }


  doToggleShowName(index: number) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let indexes = this.getIndexesTarget(index);

    // work with value of element target event
    const valueShowNames = !this.uiPcsDtoList[index].showName

    indexes.forEach(index => {
      let pcsDto = this.uiPcsDtoList[index]
      const currentShowPcs = this.uiPcsDtoList[index].showPcs
      this.uiPcsDtoList[index] = new UIPcsDto({
        ...pcsDto,
        showName: valueShowNames,
        showPcs: currentShowPcs && valueShowNames ? false : currentShowPcs
      })
    })

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doToggleShowPcsName(index: any) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let indexes = this.getIndexesTarget(index);

    // work with value of element target event
    const valueShowPcs = !this.uiPcsDtoList[index].showPcs

    indexes.forEach(index => {
      let pcsDto = this.uiPcsDtoList[index]
      const currentShowName = this.uiPcsDtoList[index].showName
      this.uiPcsDtoList[index] = new UIPcsDto({
        ...pcsDto,
        showPcs: valueShowPcs,
        showName: valueShowPcs && currentShowName ? false : currentShowName
      })
    })

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doToggleShowPivot(index: number) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let indexes = this.getIndexesTarget(index);
    // work with value of element target event
    const valueShowPivot = !this.uiPcsDtoList[index].showPivot

    indexes.forEach(index => {
      let pcsDto = this.uiPcsDtoList[index]
      this.uiPcsDtoList[index] = new UIPcsDto({
        ...pcsDto,
        showPivot: valueShowPivot,
        uiClock: {...pcsDto.uiClock}
      })
    })

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }


  private getIndexesTarget(index: number) {
    if (this.isIndexInElementsSelected(index)) {
      // do on all selected elements
      return this.orderedIndexesSelectedPcsDto
    } else {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      // do only for this one
      return [index]
    }
  }

  /**
   * Delete objects where their index is in indexToDeleteList or in orderedIndexesSelectedPcsDto
   * @param indexToDeleteList
   */
  doDelete(indexToDeleteList: number[] = []) {
    const deleteAllSelectedPcs = indexToDeleteList.length === 0
    if (deleteAllSelectedPcs) {
      indexToDeleteList = [...this.orderedIndexesSelectedPcsDto]
    }

    this.uiPcsDtoList =
      this.uiPcsDtoList.filter((value, index) => !indexToDeleteList.includes(index))

    this.doUnselectAll(false)

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  unDoPcsDtoList() {
    if (this.canUndo()) {
      // save also actual pcs (parameter to unDoToPresent)
      let pcsDtoList = this.history.unDoToPresent()
      if (pcsDtoList != undefined) {
        this.uiPcsDtoList = pcsDtoList
        this.doUnselectAll(false)
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

  public getSelectedPcsDtoIndexes(): number[] {
    return this.orderedIndexesSelectedPcsDto
  }

  /**
   * Arrange list of pcs in circle
   * @param selectedPcsIndexes pcs to repositioning
   * @param indexCenterElement pcs around which the others will be positioned (or barycenter)
   */
  doCircularAlign(selectedPcsIndexes: number[] = [], indexCenterElement ?: number) {
    if (selectedPcsIndexes.length === 0) {
      selectedPcsIndexes = this.getSelectedPcsDtoIndexes()
    }

    let finalMoveElements: FinalElementMove[] = []

    // compute barycenter
    let barycenter = new Point(0, 0)
    let radius = indexCenterElement !== undefined && selectedPcsIndexes.length <= 3
      ? this.uiPcsDtoList[indexCenterElement].width * (selectedPcsIndexes.length == 2 ? 3 : 2.5) // more space when 2 or 3 els and center elt
      : 0

    let point = new Point(0, 0)

    let spaceIfShowName = (selectedPcsIndexes.length > 3) ? 0 : 30

    // if (!indexCenterElement) {
    selectedPcsIndexes.forEach(index => {
      point.x += this.uiPcsDtoList[index].position.x + this.uiPcsDtoList[index].width / 2
      point.y += this.uiPcsDtoList[index].position.y + this.uiPcsDtoList[index].height / 2
      radius += this.uiPcsDtoList[index].width + (this.uiPcsDtoList[selectedPcsIndexes[0]].showName ? spaceIfShowName : 0)
    })
    // }

    // barycenter point
    // if (indexCenterElement) {
    //   const elCenter = this.uiPcsDtoList[indexCenterElement]
    //   barycenter.x = (elCenter.position.x + elCenter.width) / 2
    //   barycenter.y = (elCenter.position.y + elCenter.height) / 2
    // } else {
    barycenter.x = point.x / selectedPcsIndexes.length
    barycenter.y = point.y / selectedPcsIndexes.length
    // }
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
    // update selected elements
    this.orderedIndexesSelectedPcsDto = []
    this.uiPcsDtoList.forEach((pcsDto: UIPcsDto, index) => {
      if (pcsDto.isSelected) this.orderedIndexesSelectedPcsDto.push(index)
    })

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  getSerialDataContent() {
    return this.managerLocalStorageService.getSerialStringDataPcsDtoListPageWBFromLocalStorage();
  }

  /**
   * Return true if index param is into the list of indexes selected
   * @param index
   */
  isIndexInElementsSelected(index: number) {
    return this.orderedIndexesSelectedPcsDto.includes(index);
  }

  doSaveContentToFile(fileName: string = "my-project.musaicbox") {
    // console.log(`Save content to ${fileName}`)
    const blob = new Blob([this.getSerialDataContent()], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    let anchor = document.createElement("a");
    anchor.download = fileName;
    // https://stackoverflow.com/questions/55849415/type-saferesourceurl-is-not-assignable-to-type-string
    anchor.href = "" + this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(url));
    anchor.click();
  }

  /**
   * Open dialog for get a name file and save content into. After this operation,
   * if user requests it (via parameter clearContentAfterSave)
   * content is reset to blank (user can undo)
   *
   * @param clearContentAfterSave if user requests it (see eventFileNameSetByUser.subscribe...)
   */
  doOpenDialogAndSaveContentToFile(clearContentAfterSave: boolean = false) {
    this.userAskClearContentAfterSave = clearContentAfterSave
    this.dialogSaveAsFileNameService.openDialogForSaveIntoFile(this.dataSaveToFile)
  }

  /**
   * Duplicate pcs in all views (musaic, clock, score,... but not FREE_TEXT)
   * @param index pcs concerned
   */
  doDuplicateInAllViews(index: number) {
    const pcsDto = this.uiPcsDtoList[index]
    let newPcsDtoInOthersView: UIPcsDto[] = []

    UIPcsDto.ALL_DRAWERS.forEach((index, drawer) => {
      if (index != pcsDto.indexFormDrawer && index != UIPcsDto.FREE_TEXT) {
        newPcsDtoInOthersView.push(
          new UIPcsDto({
            ...pcsDto,  // on same position (because circular align in fine)
            indexFormDrawer: index,
            isSelected: true,  // will be placed in orderedIndexesSelectedPcsDto below
            uiMusaic: new UIMusaic({...pcsDto.uiMusaic, rounded: true})
          }))
      }
    })

    this.doUnselectAll(false)

    // add pcs selected (duplicate)
    newPcsDtoInOthersView.push(new UIPcsDto({...pcsDto, isSelected: true}))

    this.uiPcsDtoList = [...this.uiPcsDtoList, ...newPcsDtoInOthersView]

    for (let i = 0; i < newPcsDtoInOthersView.length; i++) {
      // add new last indexes (or elements having isSelect true, see above)
      this.orderedIndexesSelectedPcsDto.push(this.uiPcsDtoList.length - 1 - i)
    }

    // in place, because components have same position
    this.doCircularAlign()
  }

  updatePcsDto(indexPcsForEdit: number, pcs: IPcs) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    this.uiPcsDtoList[indexPcsForEdit] = new UIPcsDto({
      ...this.uiPcsDtoList[indexPcsForEdit],
      pcs: pcs,
      freeText: undefined
    })
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doGetPrimForm(whichPrime: TPrimeForm, index: number): IPcs {
    if (index < 0 || index >= this.uiPcsDtoList.length) {
      throw new Error(`bad index : ${index}`)
    }
    const pcs = this.uiPcsDtoList[index].pcs
    switch (whichPrime) {
      case 'Modal' :
        return pcs.symmetryPrimeForm()
      case 'Cyclic' :
        return pcs.cyclicPrimeForm()
      case 'Dihedral' :
        return pcs.dihedralPrimeForm()
      case 'Affine' :
        return pcs.affinePrimeForm()
      case 'Musaic' :
        return pcs.musaicPrimeForm()
      default :
        return pcs
    }
  }

  doClearContentSaveAndEmit() {
    this.doUnselectAll(false)
    this.uiPcsDtoList = []
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doFromPcsGetImages(pcs: IPcs, groupName: string, distinct: boolean = false): IPcs[] {
    const pcsList: IPcs[] = []
    if (['Affine', 'Musaic'].includes(groupName)) {
      // default Affine
      const pcsSelected = pcs.unMap()

      pcsList.push(pcsSelected)
      pcsList.push(this.managerPcsService.doTransformAffine(pcsSelected, 7, 0)) // .affineOp(7, 0))
      pcsList.push(this.managerPcsService.doTransformAffine(pcsSelected, 11, 0)) //pcsSelected.affineOp(11, 0))
      pcsList.push(this.managerPcsService.doTransformAffine(pcsSelected, 5, 0)) //pcsSelected.affineOp(5, 0))

      if (groupName === 'Musaic') {
        const pcsSelectedCplt = this.managerPcsService.complement(pcsSelected) // for set pivot
        pcsList.push(pcsSelectedCplt)
        pcsList.push(this.managerPcsService.doTransformAffine(pcsSelectedCplt, 7, 0))
        pcsList.push(this.managerPcsService.doTransformAffine(pcsSelectedCplt, 11, 0))
        pcsList.push(this.managerPcsService.doTransformAffine(pcsSelectedCplt, 5, 0))
      }
    }
    if (distinct) {
      return pcsList.reduce((unique: IPcs[], currentPcs) =>
        unique.find(pcs => pcs.cyclicPrimeForm().pid() === currentPcs.cyclicPrimeForm().pid()) ? unique : [...unique, currentPcs], [])
    }
    return pcsList
  }


  doMakeImageTransformedPcsFromGroupName(groupName: string, index: number, distinct: boolean = false) {
    const transformedPcs = this.doFromPcsGetImages(this.uiPcsDtoList[index].pcs, groupName, distinct)
    this.pcsDtoForTemplate = this.uiPcsDtoList[index]
    this.addPcs({somePcs: transformedPcs, circularAlign: true, indexCenterElement: index})
  }

  windowMaxWidth(): number {
    return this.uiPcsDtoList.reduce((max: number, current: UIPcsDto) =>
      (current.position.x + current.width > max) ? (current.position.x + current.width) : max, 0)
  }

  windowMaxHeight(): number {
    return this.uiPcsDtoList.reduce((max: number, current: UIPcsDto) =>
      (current.position.y + current.height > max) ? (current.position.y + current.height) : max, 0)
  }

  doCut(index ?: number) {
    this.doCopy(index)
    this.doDelete(index !== undefined ? [index] : [])
  }

  doCopy(index ?: number) {
    if (index === undefined || this.isIndexInElementsSelected(index)) {
      // copy selected elements
      this.managerLocalStorageService.copy(this.orderedIndexesSelectedPcsDto.map(index => this.uiPcsDtoList[index]))
    } else {
      // copy only element at index
      this.managerLocalStorageService.copy([this.uiPcsDtoList[index]])
    }
  }

  doPaste() {
    const data = this.managerLocalStorageService.paste()
    const deltaPosition = 10

    if (data) {
      const updateData = data.map(pcsDto => new UIPcsDto(
        {
          ...pcsDto,
          position: {x: pcsDto.position.x + deltaPosition, y: pcsDto.position.y + deltaPosition},
          isSelected: true
        })
      )
      this.doUnselectAll(false)

      // initialize indexes of selected elements
      this.orderedIndexesSelectedPcsDto = [...updateData.map((value, index) => this.uiPcsDtoList.length + index)]

      this.uiPcsDtoList = [...this.uiPcsDtoList, ...updateData]

      // the new orderedIndexesSelectedPcsDto is now copied element (for multiple paste command to avoid overlay)
      this.doCopy()

      this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
      this.emit()
    }
  }

  isEmptyClipboard(): boolean {
    return this.managerLocalStorageService.isEmptyClipboard()
  }

  changeColor(indexPcsForEdit: number, property: TColorProperty, value: string) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let pcsDto = new UIPcsDto({...this.uiPcsDtoList[indexPcsForEdit]})
    switch (property) {
      case "PitchColorOFF":
        pcsDto.colorPitchOff = value
        break
      case "PitchColorON":
        pcsDto.colorPitchOn = value
        break
      case "PolygonColor":
        // TODO polygon color
        break
    }
    this.uiPcsDtoList[indexPcsForEdit] = pcsDto
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doPasteFormatToSelection(indexes: number[] = []) {
    if (this.isEmptyClipboard()) return

    const template = this.managerLocalStorageService.paste()[0]

    if (!template) return // never because first guard

    this.uiPcsDtoList = [...this.uiPcsDtoList]

    if (indexes.length === 0) {
      indexes = this.orderedIndexesSelectedPcsDto
    }

    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      this.uiPcsDtoList[index] =
        new UIPcsDto({
          ...template,
          freeText: {...this.uiPcsDtoList[index].freeText}, // keep text
          pcs: this.uiPcsDtoList[index].pcs,
          position: this.uiPcsDtoList[index].position // restore position
        })
    })
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doEditFreeText(index: number) {
    this.dialogUpdateFreeTextService.openDialogForUpdateFreeText(
      {
        text: this.uiPcsDtoList[index].freeText.text,
        index: index,
        fontSize: this.uiPcsDtoList[index].freeText.fontSize || "12px"
      })
  }

  private doUpdateFreeText(data: { index: number, text: string, fontSize: string }) {
    if (data.index < 0 || data.index >= this.uiPcsDtoList.length) {
      throw new Error(`oops bad index :  ${data.index}  for ${this.uiPcsDtoList.length} elements.`)
    }

    this.uiPcsDtoList = [...this.uiPcsDtoList]

    let pcsDto = new UIPcsDto({...this.uiPcsDtoList[data.index]})

    if (!data.text) {
      data.text = pcsDto.pcs.getPcsStr()
    }

    pcsDto.freeText = {
      ...pcsDto.freeText,
      ...data,
      height: data.text.split("\n").length * (parseInt(data.fontSize) + 10)
    } // new object (keep width value)

    this.uiPcsDtoList[data.index] = pcsDto

    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }


  doMakeCyclicOrbit(index: number) {
    const pcs = this.uiPcsDtoList[index].pcs
    // let pcsCyclicList = pcs.cyclicPrimeForm().orbit.ipcsset

    let pcsCyclicList = [pcs]
    // no get from orbit cyclic because pivot not always logically set
    for (let i = 1; i < pcs.n; i++) {
      let nextPcs = pcs.transposition(i)
      // be careful with limited transposition
      if (!pcsCyclicList.find((pcs) => pcs.id === nextPcs.id)) {
        pcsCyclicList.push(nextPcs)
      }
    }

    let pcsDtoForTemplate =
      new UIPcsDto({
        ...this.uiPcsDtoList[index],
        uiClock: {...this.uiPcsDtoList[index].uiClock /*, drawPivot: false*/}
      })
    pcsDtoForTemplate.showPivot = false
    this.addPcs({
      somePcs: pcsCyclicList,
      circularAlign: true,
      indexCenterElement: index,
      templateDto: pcsDtoForTemplate
    })
  }

  doMakeModeOrbit(index: number) {
    let pcs = this.uiPcsDtoList[index].pcs
    let pcsModeList = [pcs]
    let cardinal = pcs.cardOrbitMode()
    for (let degree = 1; degree < cardinal; degree++) {
      pcs = pcs.modulation("Next")
      pcsModeList.push(pcs)
    }
    this.pcsDtoForTemplate = this.uiPcsDtoList[index]
    this.addPcs({somePcs: pcsModeList, circularAlign: true, indexCenterElement: index})
  }

  doMakeComplement(index: number) {
    this.doMakeSetOperation('Complement')
  }

  doMakeIntersection() {
    this.doMakeSetOperation('Intersection')
  }

  doMakeUnion() {
    this.doMakeSetOperation('Union')
  }

  doMakeSymmetricDifference() {
    this.doMakeSetOperation('SymmetricDifference')
  }

  /**
   * implement set operations
   * @param opName  in {'Complement', 'SymmetricDifference', 'Union', 'Intersection' } // TODO make a type
   * @private
   */
  private doMakeSetOperation(opName: string) {
    if (opName === 'Complement' && this.getSelectedPcsDtoIndexes().length > 0) {
      const complement = true
      this.doDuplicate(this.getSelectedPcsDtoIndexes()[0], complement)
    } else if (this.getSelectedPcsDtoIndexes().length > 1) {
      const pcsRef = this.uiPcsDtoList[this.getSelectedPcsDtoIndexes()[0]].pcs
      // operation requires 2 or more pcs
      // get clone array bin vector of first pcs
      let vector = [...pcsRef.vectorPcs]
      // start with 1, because first is pcs initial value for set operations with others pcs
      for (let i = 1; i < this.getSelectedPcsDtoIndexes().length; i++) {
        const pcs = this.uiPcsDtoList[this.getSelectedPcsDtoIndexes()[i]].pcs
        for (let j = 0; j < vector.length; j++) {
          switch (opName) {
            case 'SymmetricDifference' :
              vector[j] += pcs.vectorPcs[j] % 2  // xor op
              break
            case 'Union' :
              if (pcs.vectorPcs[j] === 1) {
                vector[j] = 1 // 1 iif not 0 and 0
              }
              break
            case 'Intersection' :
              vector[j] *= pcs.vectorPcs[j]  // 1 iif 1 * 1
              break
          }
        }
      }
      let newPcs = new IPcs({vectorPcs: vector})
      if (pcsRef.isComingFromAnOrbit()) {
        newPcs = ManagerPcsService.getOrMakeInstanceFromOrbitOfGroupActionOf(newPcs, pcsRef.orbit!.groupAction!)
      }
      this.addPcs({somePcs: [newPcs]})
    }
  }


  doTranspose(k: number) {
    this.doTransformAffine(1, k)
  }

  doTransformAffine(a: number, k: number) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let indexes = this.getSelectedPcsDtoIndexes()
    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      let pcsDto = new UIPcsDto({...this.uiPcsDtoList[index]})
      pcsDto.pcs = this.managerPcsService.doTransformAffine(pcsDto.pcs, a, k)
      this.uiPcsDtoList[index] = pcsDto
    })
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }

  doChangePivot(d: TDirection) {
    this.uiPcsDtoList = [...this.uiPcsDtoList]
    let indexes = this.getSelectedPcsDtoIndexes()
    indexes.forEach(index => {
      if (index < 0 || index >= this.uiPcsDtoList.length) {
        throw new Error("oops bad index : " + index)
      }
      let pcsDto = new UIPcsDto({...this.uiPcsDtoList[index]})
      pcsDto.pcs = pcsDto.pcs.modulation(d)
      this.uiPcsDtoList[index] = pcsDto
    })
    this.pushPcsDtoListToHistoryAndSaveToLocalStorage()
    this.emit()
  }
}
