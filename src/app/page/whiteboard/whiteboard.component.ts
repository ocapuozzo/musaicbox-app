import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuGroup,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger
} from "@angular/cdk/menu";
import {AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {ClockComponent} from "../../component/clock/clock.component";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {KeyValuePipe, NgClass, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {
  FinalElementMove,
  LiteralPrimeForms,
  ManagerPageWBService,
  TPrimeForm,
  TZoomDirection
} from "../../service/manager-page-wb.service";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {PcsComponent} from "../../component/pcs/pcs.component";
// import {DraggableDirective} from "../../draggable.directive";
import {Point} from "../../utils/Point";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {Router} from "@angular/router";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {RectSelectorComponent, Shape} from "../../component/rect-selector/rect-selector.component";
import {FormsModule} from "@angular/forms";
import {IPcs} from "../../core/IPcs";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfirmationComponent} from "../../component/dialog-confirmation/dialog-confirmation.component";
import {MatInput} from "@angular/material/input";
import {MatLine} from "@angular/material/core";


interface ElementMove {
  elt: HTMLElement,
  initialX: number,
  initialY: number
}

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle,
    ClockComponent,
    MusaicComponent,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatMenuContent,
    MatIconButton,
    MatIcon,
    NgStyle,
    PcsComponent,
    CdkContextMenuTrigger,
    CdkMenuGroup,
    CdkMenuItemRadio,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItemCheckbox,
    CdkMenuItem,
    NgForOf,
    NgClass,
    NgIf,
    MatSlideToggle,
    RectSelectorComponent,
    FormsModule,
    MatInput,
    MatLine,
    NgTemplateOutlet,
    KeyValuePipe
  ],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;
  @ViewChild('rectangleselector', {static: true}) rectangleSelector: ElementRef<SVGElement>;

  /**
   * For mouseMoveListener
   */
  unlistenerRenderer2Mousemove: Function;


  /**
   * Lise of UIPcsDto (from service)
   */
  pcsDtoList: UIPcsDto[]

  /**
   *  list of HTMLElement selected (to move with mouse move)
   */
  initialPointOfSelectedElements: ElementMove[] = []

  // /**
  //  * List of FormDrawer names
  //  */
  // drawers: string[]

  /**
   * Specify when button mouse is actually down
   * @private
   */
  private isDown: boolean = false

  /**
   * Point ref for compute distance to go
   * @private
   */
  private originPositionOfClickForMoving: Point;

  /**
   * set to true when context menuPcs is open, false else
   * @private
   */
  private isContextMenuOpened: boolean = false

  protected isRectangleSelecting: boolean;

  initPositionRectSelector = new Point(0, 0)

  constructor(private managerPageWBService: ManagerPageWBService,
              private readonly managerPagePcsService: ManagerPagePcsService,
              private readonly router: Router,
              private renderer2: Renderer2,
              public dialogConfirmation: MatDialog) {

    this.pcsDtoList = this.managerPageWBService.uiPcsDtoList
    // this.drawers = this.managerPageWBService.DRAWERS

    this.managerPageWBService.eventChangePcsPdoList.subscribe((uiPcsDtoList: UIPcsDto[]) => {
      this.pcsDtoList = uiPcsDtoList
      if (!this.isRectangleSelecting) {
        this.updateRectangleSelectorDimension();
      }
    })

  }

  public ngOnDestroy(): void {
    // remove listener
    this.unlistenerRenderer2Mousemove()
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // initialize event listener
    let elt = document.getElementById('white-board')

    this.unlistenerRenderer2Mousemove = this.renderer2.listen(elt, 'mousemove', e => {
      this.onMouseMove(e)
    });

    // warning by google browser

    // this.unlistenerRenderer2Touchmove = this.renderer2.listen(elt, 'touchmove', e => {
    //   this.onMouseMove(e)
    // });
    //
    // elt!.addEventListener('touchstart',
    //   (event) => this.onMouseDown(event));


    elt!.addEventListener('mousedown',
      (event) => this.onMouseDown(event));

    elt!.addEventListener('mouseup',
      (event) => this.onMouseUp(event));

    elt!.addEventListener('touchend',
      (event) => this.onMouseUp(event));

    // set elt rselector fill screen (maybe is there other way...)

    let eltRSelector = document.getElementById("rselector")
    if (eltRSelector) {
      eltRSelector!.style.zIndex = "1"
      this.updateRectangleSelectorDimension();
    }
  }

  // when mouse is out page
  // https://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
  @HostListener('window:touchend', ['$event'])
  touchEnd(e: Event) {
    this.onMouseUp(e)
  }

  @HostListener('window:mouseup', ['$event'])
  windowMouseUp(e: Event) {
    this.onMouseUp(e)
  }


  // TODO test this (without render2)

  @HostListener('window:touchmove', ['$event'])
  touchMove(e: Event) {
    this.onMouseMove(e)
  }

  @HostListener('window:touchstart', ['$event'])
  touchStart(e: Event) {
    this.onMouseDown(e)
  }

  // End test


  private updateRectangleSelectorDimension() {
    const maxWidth = Math.max(this.managerPageWBService.windowMaxWidth(), window.innerWidth)
    const maxHeight = Math.max(this.managerPageWBService.windowMaxHeight(), window.innerHeight)

    let eltRSelector = document.getElementById("rselector")
    if (eltRSelector) {
      const width = parseInt(eltRSelector!.style.width)
      if (width != maxWidth) {
        eltRSelector!.style.width = maxWidth + "px"
        eltRSelector!.style.height = maxHeight + "px"
      }
    }
  }

  onMouseDown(e: any) {
    // console.log("onMouseDown this.isDown = ", this.isDown)
    // this.isDown = true;
    e.preventDefault()
    // console.log("this.isDown =", this.isDown," this.isContextMenuOpened = ", this.isContextMenuOpened,
    //   " e.button = ", e.button, " e.ctrlKey = ", e.ctrlKey, )
    // console.log("MouseEvent : ", e)
    if (!e) return
    if (this.isContextMenuOpened) {
      // do context menu modal
      return
    }
    if (e.button > 1) {
      // console.log("Right button") or more...
      // cdkContextMenu is only concerned
      return
    }

    let pointClick: Point

    if (e.clientX) {
      pointClick = new Point(e.clientX, e.clientY)
    } else {
      pointClick = new Point(e.touches[0].clientX, e.touches[0].clientY)
    }

    if (e.ctrlKey) {
      // if not click on object in page, deselect all
      let allPcsElements = Array.from(document.getElementsByTagName('app-pcs'))

      const clickInPcsElement = allPcsElements.some(e => pointClick.isIncludeIn(e.getBoundingClientRect()))
      if (!clickInPcsElement) {
        this.doDeselectAll()
      }

      // if click on app-pcs component, then this event is managed by toggleSelected (other event listener)
      // declared in template  (mousedown)="doToggleSelected($event,idx)"
      return
    }

    this.isDown = true;

    // User can move elements by mouse action ONLY if click on a component with class 'e-selected-marker'
    let selectedElements =
      Array.from(document.getElementsByClassName('e-selected-marker'))

    const clickInSelectedElement =
      selectedElements.some(el => pointClick.isIncludeIn(el.getBoundingClientRect()))

    if (!clickInSelectedElement) {
      // let allPcsElements = Array.from(document.getElementsByTagName('app-pcs'))
      // const clickOnPcsElement = allPcsElements.some(e => pointClick.isIncludeIn(e.getBoundingClientRect()))
      // if (!clickOnPcsElement) {
        this.isRectangleSelecting = true
        this.initPositionRectSelector = pointClick
        return
      // }
    } else {
      this.isRectangleSelecting = false
    }

    // now we can initialize data for changeAreaRect component
    this.isDown = true;
    this.originPositionOfClickForMoving = pointClick

    this.initialPointOfSelectedElements = selectedElements.map((e) => (
      {
        elt: e as HTMLElement,
        initialX: parseInt((e as HTMLElement).style.left),
        initialY: parseInt((e as HTMLElement).style.top)
      }
    ))
  }

  onMouseMove(e: any) {
    e.preventDefault()

    if (this.isContextMenuOpened) {
      // do context menu modal
      return
    }

    if (this.isRectangleSelecting) {
      return
    }

    if (this.isDown) {

      e.stopPropagation()
      // final set position will set by onMouseUp event
      if (this.initialPointOfSelectedElements.length > 0) {
        if (e.clientX) {
          this.moveAt(e.clientX, e.clientY)
        } else {
          this.moveAt(e.touches[0].clientX, e.touches[0].clientY)
        }
      }
    }
  }

  // @HostListener('window:mouseup', ['$event'])
  onMouseUp(e: any) {
    if (this.isRectangleSelecting) {
      this.isRectangleSelecting = false
      this.isDown = false;
      return
    }
    if (!this.isDown) {
      return
    }
    this.isDown = false;

    if (e.button > 1) {
      // context menu handles this
      return
    }

    if (this.initialPointOfSelectedElements.length === 0) {
      return
    }

    let finalMoveElements: FinalElementMove[] = this.initialPointOfSelectedElements.map((e) => ({
      index: parseInt(e.elt.getAttribute('data-index-pcsdtos') || "-1"),
      x: parseInt(e.elt.style.left),
      y: parseInt(e.elt.style.top)
    }))

    this.managerPageWBService.doFinalPosition(finalMoveElements)

    // As component is automatically selected when solo,
    // we auto-deselect it here.
    if (finalMoveElements.length === 1) {
      this.managerPageWBService.doToggleSelected(finalMoveElements[0].index)
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // console.log("event = ", event)
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "z" :
          this.doUnDo()
          break
        case "y" :
          this.doReDo()
          break
        case "x" :
          this.doCut()
          break
        case "c" :
          this.doCopy()
          break
        case "v" :
        case "V" :
          if (event.shiftKey) {
            this.doPasteFormat()
          } else {
            this.doPaste()
          }
          break
      }
    }

    if (event.key === "+") {
      this.doZoom(1)
    }
    if (event.key === "-") {
      this.doZoom(-1)
    }
  }

  /**
   * DOM action : set elements position synchro with mousemove
   * @param x
   * @param y
   */
  moveAt(x: number, y: number) {
    this.initialPointOfSelectedElements.forEach((e) => {
      let el = e.elt
      el.style.left = (e.initialX + x - this.originPositionOfClickForMoving.x) + 'px';
      el.style.top = (e.initialY + y - this.originPositionOfClickForMoving.y) + 'px';
    })
  }

  doZoom(direction: TZoomDirection, index ?: number) {
    try {
      if (index === undefined || this.managerPageWBService.isIndexInElementsSelected(index)) {
        this.managerPageWBService.doZoom(direction)
      } else if (index >= 0 && index < this.pcsDtoList.length) {
        this.managerPageWBService.doZoom(direction, [index])
      }
    } catch (e) {
      // Should not happen... (bad index)
      console.error(e)
    }
  }

  doSetRounded(index: number) {
    const roundedOn = this.pcsDtoList[index].uiMusaic.rounded

    if (this.managerPageWBService.isIndexInElementsSelected(index)) {
      this.managerPageWBService.doSetRounded(!roundedOn)
    } else {
      this.managerPageWBService.doSetRounded(!roundedOn, [index])
    }
  }

  updateDrawer(drawer: string, index: number) {
    if (this.managerPageWBService.isIndexInElementsSelected(index)) {
      this.managerPageWBService.doUpdateDrawer(drawer)
    } else {
      this.managerPageWBService.doUpdateDrawer(drawer, [index])
    }
  }

  // on mouse up event (template used)
  doToggleSelected($event: MouseEvent, index: number) {
    if (!this.pcsDtoList.some((pcsDto) => pcsDto.isSelected)) {
      // no select component, select this one
      this.managerPageWBService.doToggleSelected(index)
    } else if ($event.ctrlKey) {
      // rem : ctrlKey on no component is manager by mouseDown handler
      // toggle selected component at index
      this.managerPageWBService.doToggleSelected(index)
    } else {
      // temporary tip for deactivate focus pitch of abc component...
      this.managerPageWBService.doToggleSelected(index)
      this.managerPageWBService.doToggleSelected(index)

      // classic use ? : deselect all and select this one
      // if (!this.managerPageWBService.isIndexInElementsSelected(index)) {
      //   // this.managerPageWBService.doUnselectAll(false)
      //   this.managerPageWBService.doToggleSelected(index)
      // }
    }
  }

  /**
   * deselect (reset) all selected component
   * Called when user do a Ctrl+MouseDown over nothing,
   *
   */
  protected doDeselectAll() {
    this.managerPageWBService.doUnselectAll()
  }

  isMusaicFormDrawer(index: number) {
    return index < 0 || index >= this.pcsDtoList.length || this.pcsDtoList[index].indexFormDrawer === UIPcsDto.MUSAIC
  }

  doDuplicate(index: number) {
    this.managerPageWBService.doDuplicate(index)
  }

  // see doCut
  // doDelete(index: any) {
  //   if (!this.managerPageWBService.isIndexInElementsSelected(index)) {
  //     this.managerPageWBService.doDelete([index])
  //   } else {
  //     this.managerPageWBService.doDelete()
  //   }
  // }

  doPushToPcsPage(index: number) {
    // this.indexDtoPcsForUpdate = index
    this.managerPagePcsService.replaceBy(this.pcsDtoList[index].pcs, index)
    this.managerPageWBService.setPcsDtoForTemplate(this.pcsDtoList[index])
    this.router.navigateByUrl('/pcs');
  }

  isSelected(index: number) {
    return index >= 0 && index < this.pcsDtoList.length && this.pcsDtoList[index].isSelected;
  }

  /**
   * Return true if this.pcsDtoList[index] is only selected element or if nobody element is selected
   * return false else
   * @param index
   */
  isSolo(index: number) {
    return this.managerPageWBService.isIndexInElementsSelected(index)
      && this.managerPageWBService.orderedIndexesSelectedPcsDto.length === 1
      || !this.managerPageWBService.orderedIndexesSelectedPcsDto.includes(index)

  }

  get numberSelectedComponents(): number {
    return this.managerPageWBService.orderedIndexesSelectedPcsDto.length
    // return this.pcsDtoList.reduce(
    //   (nbSelected: number, pcsdDto: UIPcsDto) => pcsdDto.isSelected ? nbSelected + 1 : nbSelected, 0)
  }

  /**
   * Set selected/unselected pcs component (for touch event)
   * @param index
   */
  doSingleToggleSelected(index: number) {
    if (index >= 0 && index < this.pcsDtoList.length) {
      this.managerPageWBService.doToggleSelected(index)
    }
  }

  doUnDo() {
    this.managerPageWBService.unDoPcsDtoList()
  }

  doReDo() {
    this.managerPageWBService.reDoPcsDtoList()
  }

  get canUndo(): boolean {
    return this.managerPageWBService.canUndo()
  }

  get canRedo(): boolean {
    return this.managerPageWBService.canRedo()
  }

  doContextMenuOpen() {
    this.isContextMenuOpened = true
  }

  doContextMenuClose() {
    this.isContextMenuOpened = false
  }

  isRounded(index: number) {
    return (index >= 0 && index < this.pcsDtoList.length && this.pcsDtoList[index].uiMusaic.rounded)
  }

  sizeCellWidth(index: number) {
    return (index >= 0 && index < this.pcsDtoList.length && this.pcsDtoList[index].uiMusaic.widthCell)
  }

  doSelectAll() {
    this.managerPageWBService.doSelectAll()
  }

  doVerticalAlign() {
    this.managerPageWBService.doVerticalAlign()
  }

  doHorizontalAlign() {
    this.managerPageWBService.doHorizontalAlign()
  }

  doCircularAlign() {
    this.managerPageWBService.doCircularAlign()
  }

  doCheckPcsComponentsInRectangleSelector(shape: Shape) {
    let point = new Point(0, 0)

    this.pcsDtoList.forEach((pcsDto, index) => {
      point.x = pcsDto.position.x
      point.y = pcsDto.position.y
      if (this.isInclude(pcsDto.position.x, pcsDto.position.y, pcsDto.width, pcsDto.height, shape)) {
        if (!pcsDto.isSelected) {
          this.managerPageWBService.doToggleSelected(index)
        }
      } else {
        if (pcsDto.isSelected) {
          this.managerPageWBService.doToggleSelected(index)
        }
      }
    })
  }

  isInclude(px: number, py: number, w: number, h: number, rect: Shape): boolean {
    return this.rectanglesIntersect(px, py, px + w, py + h,
      rect.x, rect.y, rect.x + rect.w, rect.y + rect.h)
  }

  doDownZIndexRectangleSelector() {
    let eltRSelector = document.getElementById("rselector")
    eltRSelector!.style.zIndex = "1"
    // this.rectangleSelector.nativeElement.style.zIndex = "1"
  }

  doUpZIndexRectangleSelector() {
    let eltRSelector = document.getElementById("rselector")
    eltRSelector!.style.zIndex = "2000"
    // this.rectangleSelector.nativeElement.style.zIndex = "2000" // don't work
  }

  rectanglesIntersect(minAx: number, minAy: number, maxAx: number, maxAy: number,
                      minBx: number, minBy: number, maxBx: number, maxBy: number): boolean {
    return maxAx >= minBx && minAx <= maxBx && minAy <= maxBy && maxAy >= minBy
  }

  /////////// persistence logic zone

  onLoadLocalFile(event: any) {
    // const fileName = event.target.files[0].name;
    this.uploadDocument(event.target.files[0])
  }

  doOpenLocalFile() {
    let element: HTMLElement = document.querySelector('input[type="file"]') as HTMLElement;
    element.click();
  }

  //https://stackoverflow.com/questions/47581687/read-a-file-and-parse-its-content
  uploadDocument(file: File) {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      this.managerPageWBService.doReplaceContentBy(fileReader.result + "")
    }
    fileReader.readAsText(file);
  }

  doOpenDialogSaveToFile() {
    this.managerPageWBService.doOpenDialogAndSaveContentToFile()
  }

  ///// End persistence logic zone

  canShowChordName(index: number) {
    return this.pcsDtoList[index].showName
    /*return this.pcsDtoList[index].indexFormDrawer === 1
      && [3, 4].includes(this.pcsDtoList[index].pcs.cardinal)
      && this.pcsDtoList[index].pcs.getChordName()*/
  }

  doToggleShowNames(index: number) {
    this.managerPageWBService.doToggleShowName(index)
  }

  isShowName(index: number) {
    return this.pcsDtoList[index].showName
  }

  doDuplicateInAllViews(index: number) {
    this.managerPageWBService.doDuplicateInAllViews(index)
  }

  protected readonly console = console;

  doGetPrimForm(whichPrime: TPrimeForm, index: number) {
    const primeForm = this.managerPageWBService.doGetPrimForm(whichPrime, index)
    if (primeForm) {
      this.managerPageWBService.setPcsDtoForTemplate(this.pcsDtoList[index])
      this.managerPageWBService.addPcs({somePcs: [primeForm]})
    }
  }

  samePcsAs(whichPrimeForm: TPrimeForm, index: number): boolean {
    switch (whichPrimeForm) {
      case 'Modal':
        const pcsSelected = this.managerPageWBService.uiPcsDtoList[index].pcs
        const thisModalPrimeForm = this.managerPageWBService.doGetPrimForm(whichPrimeForm, index)
        return pcsSelected.pid() === thisModalPrimeForm.pid()

      case 'Cyclic':
        const modalPrimeForm = this.managerPageWBService.uiPcsDtoList[index].pcs
        const thisCyclicPrimeForm = this.managerPageWBService.doGetPrimForm(whichPrimeForm, index)
        return modalPrimeForm.pid() === thisCyclicPrimeForm.pid()

      case 'Dihedral':
        const cyclicPrimeForm = this.managerPageWBService.doGetPrimForm('Cyclic', index)
        const thisDihedralPrimeForm = this.managerPageWBService.doGetPrimForm(whichPrimeForm, index)
        return cyclicPrimeForm.pid() === thisDihedralPrimeForm.pid()

      case 'Affine' :
        const dihedralPrimeForm = this.managerPageWBService.doGetPrimForm('Dihedral', index)
        const thisAffinePrimeForm = this.managerPageWBService.doGetPrimForm(whichPrimeForm, index)
        return dihedralPrimeForm.pid() === thisAffinePrimeForm.pid()

      case 'Musaic' :
        const affinePrimeForm = this.managerPageWBService.doGetPrimForm('Affine', index)
        const primeForm = this.managerPageWBService.doGetPrimForm(whichPrimeForm, index)
        return affinePrimeForm.pid() === primeForm.pid()
      default :
        return true
    }
  }

  doGetAllPrimForm(index: any) {
    let primeForms: Map<number, IPcs> = new Map<number, IPcs>()
    // const pcsSelected = this.managerPageWBService.uiPcsDtoList[index].pcs

    // iterate over literal type :
    //  https://stackoverflow.com/questions/40863488/how-can-i-iterate-over-a-custom-literal-type-in-typescript
    // get all PF, and put them into a map (or a set, but order is not guaranteed), so avoid duplicate
    LiteralPrimeForms.forEach((primeForm: TPrimeForm) => {
      let pf: IPcs = this.managerPageWBService.doGetPrimForm(primeForm, index)
      primeForms.set(pf.pid(), pf)
    })
    if (primeForms.size > 0) {
      this.managerPageWBService.setPcsDtoForTemplate(this.pcsDtoList[index])
      this.managerPageWBService.addPcs({
        somePcs: [...primeForms.values()],
        circularAlign: true,
        indexCenterElement: index
      })
    }
  }

  doClearContent() {
    this.dialogConfirmation
      .open(DialogConfirmationComponent, {
        data: `Clear content ?`
      })
      .afterClosed()
      .subscribe((confirmation: Boolean | number) => {
        if (confirmation === true) {
          this.managerPageWBService.doClearContentSaveAndEmit()
        } else if (typeof confirmation === 'number') {
          // console.log("Call save before clear content")
          const clearContentAfterSavingToFile = true
          this.dialogConfirmation.closeAll()
          this.managerPageWBService.doOpenDialogAndSaveContentToFile(clearContentAfterSavingToFile)
        } else {
          // console.log("DO NOT clear content")
        }
      });
  }

  doGetPcsMusaicMotifs(typeFacet: string, index: number, distinct: boolean = false) {
    if (index !== undefined && (index < 0 || index >= this.pcsDtoList.length)) {
      throw new Error(`Invalid index : $ {index}`)
    }
    // add all motifs
    this.managerPageWBService.doPcsMusaicMotifs(typeFacet, index, distinct)
    // deselect component source, because is it duplicate (present as pcs facet)
    this.managerPageWBService.doToggleSelected(index)
  }

  howManyDistinctAffineMotifs(index: number): number {
    if (index !== undefined && (index < 0 || index >= this.pcsDtoList.length)) {
      throw new Error(`Invalid index : $ {index}`)
    }
    return this.managerPageWBService.doGetPcsFacetsFromPcs(this.pcsDtoList[index].pcs, 'Affine', true).length;
  }

  howManyDistinctMusaicMotifs(index: number): number {
    if (index !== undefined && (index < 0 || index >= this.pcsDtoList.length)) {
      throw new Error(`Invalid index : $ {index}`)
    }
    return this.managerPageWBService.doGetPcsFacetsFromPcs(this.pcsDtoList[index].pcs, 'Musaic', true).length;
  }

  doCut(index ?: number) {
    if (index !== undefined && (index < 0 || index >= this.pcsDtoList.length)) {
      throw new Error(`Invalid index : $ {index}`)
    }
    this.managerPageWBService.doCut(index)
  }

  doCopy(index ?: number) {
    // rem : this.pcsDtoList is this.managerPageWBService.uiPcsDtoList
    if (index !== undefined && (index < 0 || index >= this.pcsDtoList.length)) {
      throw new Error(`Invalid index : $ {index}`)
    }
    this.managerPageWBService.doCopy(index)
  }

  doPaste() {
    this.managerPageWBService.doPaste()
  }

  isEmptyClipboard() : boolean {
    return this.managerPageWBService.isEmptyClipboard()
  }

  doPasteFormat(index ?: number) {
    if (index === undefined) {
      this.managerPageWBService.doPasteFormatToSelection()
    } else if (index >= 0 && index < this.pcsDtoList.length) {
      if (this.managerPageWBService.isIndexInElementsSelected(index)) {
        this.managerPageWBService.doPasteFormatToSelection()
      } else {
        this.managerPageWBService.doPasteFormatToSelection([index])
      }
    }
  }

  colorPitchON(e:any, index: number) {
    this.managerPageWBService.changeColor(index, "PitchColorON", e.target.value)
    // doContextMenuClose is not called (?)
    this.isContextMenuOpened = false
  }
  colorPitchOFF(e:any, index: number) {
    this.managerPageWBService.changeColor(index, "PitchColorOFF", e.target.value)
    // doContextMenuClose is not called (?)
    this.isContextMenuOpened = false
  }

  doGoColorPitchOn() {
    let el = document.getElementById("colorPitchOn") as HTMLInputElement
    el.style.display = "inline"
  }

  doGoColorPitchOff() {
    let el = document.getElementById("colorPitchOff") as HTMLInputElement
    el.style.display = "inline"
  }

  doEditFreeText(index: number) {
    this.managerPageWBService.doEditFreeText(index)
  }

  protected readonly UIPcsDto = UIPcsDto;

  doMakeCyclicOrbit(index: number) {
    if (index !== undefined && (index < 0 || index >= this.pcsDtoList.length)) {
      throw new Error(`Invalid index : $ {index}`)
    }
    this.managerPageWBService.doMakeCyclicOrbit(index)
  }

  doMakeModeOrbit(index: any) {
    if (index !== undefined && (index < 0 || index >= this.pcsDtoList.length)) {
      throw new Error(`Invalid index : $ {index}`)
    }
    this.managerPageWBService.doMakeModeOrbit(index)
    this.managerPageWBService.doToggleSelected(index)
  }
}
