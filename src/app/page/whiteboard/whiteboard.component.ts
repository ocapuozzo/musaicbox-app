import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {ClockComponent} from "../../component/clock/clock.component";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {NgStyle} from "@angular/common";
import {ManagerLocalStorageService} from "../../service/manager-local-storage.service";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";
import {MusaicRComponent} from "../../component/musaic/musaicR.component";
import {UIPcsDto} from "../../ui/UIPcsDto";

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
    MusaicRComponent
  ],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;

  pcs42 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[42].getPcsMin()

  pcsDto42 = new UIPcsDto({pcs:this.pcs42})

  pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[87].getPcsMin()
  pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[38].getPcsMin().complement().modalPrimeForm()
  pcs3 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[36].getPcsMin().complement().modalPrimeForm()

  sizes = [{ w:180, h:180 }, { w:117, h:117 },  { w:117, h:117 }];
  dragging = false;

  pcsDtoList : UIPcsDto[]

  constructor(private managerPageWBService : ManagerPageWBService,
              private changeDetector: ChangeDetectorRef) {

    this.pcsDtoList = this.managerPageWBService.uiPcsDtoList
    // this.managerPageWBService.eventChangePcsPdoList.subscribe((uiPcsDtoList : UIPcsDto[]) => {
    //   this.pcsDtoList = uiPcsDtoList
    //
    // })
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

  doClick(event: any, index: number) {
    if (! this.dragging) {
      if (event.ctrlKey) {
        this.changeSize(index);
      }
    } else {
      this.dragging = false

      // for not display matMenu at end of drag
      event.stopPropagation()
    }
  }

  private changeSize2(index: number) {
    this.pcsDtoList[index].uiMusaic.width += 10
    this.pcsDtoList[index] = new UIPcsDto({
      ...this.pcsDtoList[index]
    })
    console.log(this.pcsDtoList[index])
  }

  private changeSize3(index: number) {
    this.pcsDto42.uiMusaic.width = this.pcsDto42.uiMusaic.width + 30
    this.pcsDto42.uiMusaic.height = this.pcsDto42.uiMusaic.height + 30
    this.pcsDto42 = new UIPcsDto({
      ...this.pcsDto42
    })

    // this.pcsDto42.uiMusaic.width = this.pcsDto42.uiMusaic.width + 10
    // this.pcsDto42 = newPcsDto
    // console.log("this.pcsDto42 updated")
    console.log(this.pcsDto42.uiMusaic)
  }


  private changeSize(index: number) {
    if (this.sizes[index].w === 299) {
      this.sizes[index] = {w: 143, h: 143}
    } else {
      this.sizes[index] = {w: 299, h: 299}
    }
  }

  menuTopLeftPosition = { x: '0', y: '0' }

  onRightClick(event: MouseEvent) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();

    // we record the mouse position in our object
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    // we open the menu
    this.matMenuTrigger.openMenu();
  }

  selectedMenu(index: number) {
    console.log("selected " + index)
    // let index = text.index //parseInt(text.substring(3)) - 1
    // this.changeSize(index)
    this.changeSize3(index)


  }

  startDragging() {
     // console.log("dragging = " + this.dragging)
     this.dragging = true;
  }

  menuOpened() {
    console.log("menuOpened()")
  }

  protected readonly console = console;

}
