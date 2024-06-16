import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragHandle, CdkDragMove} from "@angular/cdk/drag-drop";
import {ClockComponent} from "../../component/clock/clock.component";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {NgForOf, NgStyle} from "@angular/common";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";
import {MusaicRComponent} from "../../component/musaic/musaicR.component";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {PcsComponent} from "../../component/pcs/pcs.component";
import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuGroup, CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger
} from "@angular/cdk/menu";
import {DraggableDirective} from "../../draggable.directive";

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
    DraggableDirective
  ],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  dragging = false;

  pcsDtoList: UIPcsDto[]
  drawers: string[]

  constructor(private managerPageWBService: ManagerPageWBService,
              private changeDetector: ChangeDetectorRef) {

    this.pcsDtoList = this.managerPageWBService.uiPcsDtoList
    this.drawers = this.managerPageWBService.drawers

    this.managerPageWBService.eventChangePcsPdoList.subscribe((uiPcsDtoList: UIPcsDto[]) => {
      this.pcsDtoList = uiPcsDtoList
      // console.log("this.pcsDtoList[0] = ", this.pcsDtoList[0])
    })
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // this.pcsDtoList = this.managerPageWBService.uiPcsDtoList
    // this.managerPageWBService.refresh()
  }

  ngAfterContentChecked(): void {
    // this.changeDetector.detectChanges();
  }


  startDragging() {
    // console.log("dragging = " + this.dragging)
    this.dragging = true;
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

//
//   onDragEnd(event: any, index: number) {
//    let evt = event as CdkDragMove
//     let element = evt.source.getRootElement();
//    let trans =  element.style.transform
//     console.log("element.transforme = ", trans);
//     let newPos = element.getBoundingClientRect();
//     console.log("element.getBoundingClientRect() = ", newPos);
//
//     let parentPosition = this.getPosition(element);
//     console.log('x: ' + (newPos.x - parentPosition.left), 'y: ' + (newPos.y - parentPosition.top));
//
//     // let newPos = evt.source.getRootElement().getBoundingClientRect();
// //    evt.source._dragRef.reset();
//
//     let position = {x:newPos.x - parentPosition.left, y:newPos.y - parentPosition.top}
//
//     // let position =  {x:newPos.left, y:newPos.y  - evt.source.getRootElement().offsetTop}
//     // let position =  {x:newPos.left, y:(newPos.y - newPos.height/2)}
//     // // let position =  {x:newPos.left, y:(newPos.y - newPos.height)}
//     // let position =  {x:newPos.x, y:newPos.y}
//     // // console.log("currentPos = ", position);
//     // //
//     // this.managerPageWBService.doChangePosition(position, index)
//
//     // console.log("currentPos = ", this.position);
//     //
//     //
//     //
//     // let currentPos =  this.position = evt.source.getFreeDragPosition()
//     // evt.source._dragRef.reset();
//     // this.position = currentPos
//     // console.log("currentPos = ", currentPos);
//     // console.log("this.position = ", this.position);
//     // console.log(evt.source.getFreeDragPosition());
//   }

  // getPosition(el:any) {
  //   let x = 0;
  //   let y = 0;
  //   while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
  //     x += el.offsetLeft - el.scrollLeft;
  //     y += el.offsetTop - el.scrollTop;
  //     el = el.offsetParent;
  //   }
  //   return { top: y, left: x };
  // }
}
