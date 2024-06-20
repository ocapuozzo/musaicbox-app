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
import {CdkDrag, CdkDragHandle, CdkDragMove} from "@angular/cdk/drag-drop";
import {ClockComponent} from "../../component/clock/clock.component";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {NgClass, NgForOf, NgStyle} from "@angular/common";
import {FinalElementMove, ManagerPageWBService} from "../../service/manager-page-wb.service";
import {MusaicRComponent} from "../../component/musaic/musaicR.component";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {PcsComponent} from "../../component/pcs/pcs.component";
import {DraggableDirective} from "../../draggable.directive";
import {Point} from "../../utils/Point";

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
    MusaicRComponent,
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
              private renderer: Renderer2) {

    this.pcsDtoList = this.managerPageWBService.uiPcsDtoList
    this.drawers = this.managerPageWBService.drawers

    this.managerPageWBService.eventChangePcsPdoList.subscribe((uiPcsDtoList: UIPcsDto[]) => {
      this.pcsDtoList = uiPcsDtoList
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
      if (this.isDown) {
        // console.log("nb selected elements : ", this.initialPointOfSelectedElements.length)
        if (this.initialPointOfSelectedElements.length > 0) {
          this.moveAt(e.clientX, e.clientY)
        }
      }
    });

    // @ts-ignore
    elt.addEventListener('mousedown',
      (event) => this.onMouseDown(event));
    // @ts-ignore
    elt.addEventListener('mouseup',
      (event) => this.onMouseUp(event));

    console.log(this.pcsDtoList)
  }

  ngAfterContentChecked(): void {
    // this.changeDetector.detectChanges();
  }

  onMouseDown(e: MouseEvent) {
    // console.log("MouseEvent : ", e)
    if (!e) return
    if (e.button > 1) {
      // console.log("Right button") or more...
      // cdkContextMenu is only concerned
      return
    }

    const pointClick: Point = new Point(e.clientX, e.clientY)

    if (e.ctrlKey) {
      // if not click on object in page, deselect all
      let pcsElements = Array.from(document.getElementsByTagName('app-pcs'))

      const clickInPcsElement = pcsElements.some(e => pointClick.isIncludeIn(e.getBoundingClientRect()))
      if (!clickInPcsElement) {
        this.doUnselectAll()
      }

      // else managed by toggleSelected of a pcs component (other event listener)
      // declared in template  (mousedown)="toggleSelected($event,idx)"
      return
    }

    // User can move elements by mouse action ONLY if click on a component with class 'e-selected'
    let selectedElements = Array.from(document.getElementsByClassName('e-selected'))
    const clickInSelectedElement = selectedElements.some(e => pointClick.isIncludeIn(e.getBoundingClientRect()))

    if (!clickInSelectedElement) {
      return
    }

    // now we can initialize data for moving component
    this.isDown = true;
    this.originPositionOfClickForMoving = pointClick //new Point(e.clientX, e.clientY)

    this.initialPointOfSelectedElements = selectedElements.map((e) => (
      {
        elt: e as HTMLElement,
        initialX: parseInt((e as HTMLElement).style.left),
        initialY: parseInt((e as HTMLElement).style.top)
      }
    ))
  }

  onMouseUp(e: MouseEvent) {
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

  doZoom(positif: number, index: number) {
    this.managerPageWBService.doZoom(positif, index)
  }

  toggleRounded(index: number) {
    this.managerPageWBService.toggleRounded(index)
  }

  updateDrawer(drawer: string, index: number) {
    this.managerPageWBService.doUpdateDrawer(drawer, index)
  }

  toggleSelected($event: MouseEvent, index: number) {
    if ($event.ctrlKey) {
      console.log("doToggleSelected in wb")
      this.managerPageWBService.doToggleSelected(index)
    }
  }

  /**
   * deselect (reset) all selected component
   * Called when user do a Ctrl+MouseDown over nothing,
   *
   * @private
   */
  private doUnselectAll() {
    // a Ctrl mouse down not over a "pcs element" => deselect all selected components
    let pcsElements = Array.from(document.getElementsByClassName('e-selected'))
    if (pcsElements.length > 0) {
      let indexSelectedElements: number[] = pcsElements.map((e) => (
        parseInt(e.getAttribute('data-index-pcsdtos') || "-1")))
      this.managerPageWBService.doUnselectAll(indexSelectedElements)
      this.initialPointOfSelectedElements = []
    }
  }

  disabledIfNotMusaicFormDrawer(index: number) {
    return index < 0 || index >= this.pcsDtoList.length || this.pcsDtoList[index].indexFormDrawer !== UIPcsDto.MUSAIC
  }

  roundedOnOff(index: number): string {
    return (index > 0
      && index < this.pcsDtoList.length
      && this.pcsDtoList[index].uiMusaic.rounded) ?
      "OFF" : "ON"
  }
}
