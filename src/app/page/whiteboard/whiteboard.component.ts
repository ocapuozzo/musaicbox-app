import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuGroup, CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger
} from "@angular/cdk/menu";
import {
  AfterViewInit,
  Component,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {ClockComponent} from "../../component/clock/clock.component";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {NgClass, NgForOf, NgStyle} from "@angular/common";
import {FinalElementMove, ManagerPageWBService} from "../../service/manager-page-wb.service";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {PcsComponent} from "../../component/pcs/pcs.component";
import {DraggableDirective} from "../../draggable.directive";
import {Point} from "../../utils/Point";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {Router} from "@angular/router";

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
    DraggableDirective,
    NgClass
  ],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  /**
   * For mouseMoveListener
   */
  listenerRenderer2Mousemove: Function;

  /**
   * Lise of UIPcsDto (from service)
   */
  pcsDtoList: UIPcsDto[]

  /**
   *  list of HTMLElement selected (to move with mouse move)
   */
  initialPointOfSelectedElements: ElementMove[] = []

  /**
   * List of FormDrawer names
   */
  drawers: string[]

  /**
   * Specify when bouton mouse is actually down
   * @private
   */
  private isDown: boolean = false

  /**
   * Point ref for compute distance to go
   * @private
   */
  private originPositionOfClickForMoving: Point;

  constructor(private managerPageWBService: ManagerPageWBService,
              private readonly managerHomePcsService: ManagerPagePcsService,
              private readonly router: Router,
              private renderer: Renderer2) {

    this.pcsDtoList = this.managerPageWBService.uiPcsDtoList
    this.drawers = this.managerPageWBService.DRAWERS

    this.managerPageWBService.eventChangePcsPdoList.subscribe((uiPcsDtoList: UIPcsDto[]) => {
      this.pcsDtoList = uiPcsDtoList // [...uiPcsDtoList]
    })

  }

  ngOnDestroy() {
    // remove listener
    this.listenerRenderer2Mousemove();
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // initialize event listener
    let elt = document.getElementById('white-board')

    this.listenerRenderer2Mousemove = this.renderer.listen(elt, 'mousemove', e => {
       this.onMouseMove(e)
    });

    this.listenerRenderer2Mousemove = this.renderer.listen(elt, 'touchmove', e => {
      this.onMouseMove(e)
    });

    elt!.addEventListener('touchstart',
      (event) => this.onMouseDown(event));

    elt!.addEventListener('mousedown',
      (event) => this.onMouseDown(event));

    elt!.addEventListener('mouseup',
      (event) => this.onMouseUp(event));

    elt!.addEventListener('touchend',
      (event) => this.onMouseUp(event));

  }

  ngAfterContentChecked(): void {
    // this.changeDetector.detectChanges();
  }

  onMouseMove(e: any) {
    if (this.isDown) {
      e.preventDefault()
      // console.log("nb selected elements : ", this.initialPointOfSelectedElements.length)
      if (this.initialPointOfSelectedElements.length > 0) {
        if (e.clientX) {
          this.moveAt(e.clientX, e.clientY)
        } else {
          this.moveAt(e.touches[0].clientX, e.touches[0].clientY)
        }
      }
    }
  }

  onMouseDown(e: any) {
    // console.log("MouseEvent : ", e)
    if (!e) return
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
      let pcsElements = Array.from(document.getElementsByTagName('app-pcs'))

      const clickInPcsElement = pcsElements.some(e => pointClick.isIncludeIn(e.getBoundingClientRect()))
      if (!clickInPcsElement) {
        this.doUnselectAll()
      }

      // if click on app-pcs component, then this event is managed by toggleSelected (other event listener)
      // declared in template  (mousedown)="toggleSelected($event,idx)"
      return
    }

    // User can move elements by mouse action ONLY if click on a component with class 'e-selected'
    let selectedElements =
      Array.from(document.getElementsByClassName('e-selected'))
    const clickInSelectedElement =
      selectedElements.some(e => pointClick.isIncludeIn(e.getBoundingClientRect()))

    if (!clickInSelectedElement) {
      // no component selected to move
      return
    }

    // now we can initialize data for moving component
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

  onMouseUp(e: any) {
    if (! this.isDown) {
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

  protected readonly console = console;
  pcsDtoId(index : number, pcsDto: UIPcsDto) {
      return pcsDto ? pcsDto.id : undefined
  }


  doZoom(direction: number, index: number) {
    this.managerPageWBService.doZoom(direction, [index])
  }

  toggleRounded(index: number) {
    this.managerPageWBService.toggleRounded(index)
  }

  updateDrawer(drawer: string, index: number) {
    this.managerPageWBService.doUpdateDrawer(drawer, index)
  }

  toggleSelected($event: MouseEvent, index: number) {
   if (!this.pcsDtoList.some((pcsDto) =>  pcsDto.isSelected)) {
     this.managerPageWBService.doToggleSelected(index)
   }
  //  else if (this.pcsDtoList.filter(pcsDto => pcsDto.isSelected).length == 1) {
  //    // if (this.pcsDtoList.some((pcsDto, idx) =>  pcsDto.isSelected && idx === index)) {
  //      this.managerPageWBService.doToggleSelected(index)
  //    // }
  // }
    else if ($event.ctrlKey) {
      this.managerPageWBService.doToggleSelected(index)
    }
  }

  /**
   * deselect (reset) all selected component
   * Called when user do a Ctrl+MouseDown over nothing,
   *
   */
  private doUnselectAll() {
    this.managerPageWBService.doUnselectAll()
  }

  disabledIfNotMusaicFormDrawer(index: number) {
    return index < 0 || index >= this.pcsDtoList.length || this.pcsDtoList[index].indexFormDrawer !== UIPcsDto.MUSAIC
  }

  disabledIfSelectionIsEmpty() : boolean {
    return !this.pcsDtoList.some(pcsDto => pcsDto.isSelected)
  }

  roundedOnOff(index: number): string {
    return (index > 0
      && index < this.pcsDtoList.length
      && this.pcsDtoList[index].uiMusaic.rounded) ?
      "OFF" : "ON"
  }

  doDuplicate(index : number) {
    this.doUnselectAll()
    this.managerPageWBService.doDuplicate([index])
  }

  doDelete(index: any) {
    this.managerPageWBService.doDelete([index])
  }

  doDuplicateSelection() {
   const indexOfSelectedComponents =
     this.pcsDtoList.map((value, index) => index)
       .filter(index => this.pcsDtoList[index].isSelected)

    this.doUnselectAll() // because duplicate are new selected components
    this.managerPageWBService.doDuplicate(indexOfSelectedComponents)
  }


  doDeleteSelection() {
    const indexOfSelectedComponents =
      this.pcsDtoList.map((value, index) => index)
        .filter(index => this.pcsDtoList[index].isSelected)

    this.managerPageWBService.doDelete(indexOfSelectedComponents)
  }

  doZoomSelection(direction : number) {
    const indexOfSelectedComponents =
      this.pcsDtoList.map((value, index) => index)
        .filter(index => this.pcsDtoList[index].isSelected)
    this.managerPageWBService.doZoom(direction, indexOfSelectedComponents)
  }

  doPushToPcsPage(index: number) {
    this.managerHomePcsService.replaceBy(this.pcsDtoList[index].pcs)
    this.router.navigateByUrl('/pcs');
  }

  isSelected(index: any) {
    return index >=0 && index < this.pcsDtoList.length && this.pcsDtoList[index].isSelected;
  }

  /**
   * Set selected/unselected pcs component (for touch event)
   * @param index
   */
  doToggleSelected(index: number) {
    this.managerPageWBService.doToggleSelected(index)
  }
}
