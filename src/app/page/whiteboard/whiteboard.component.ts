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
import {PcsComponent} from "../../component/pcs/pcs.component";

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
    PcsComponent
  ],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;

  pcs42 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[42].getPcsMin()
  pcs13 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[65].getPcsMin()

  pcsDto42 = new UIPcsDto({pcs:this.pcs42})
  pcsDto13 = new UIPcsDto({pcs:this.pcs13})

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

  ngOnInit() { }

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

  startDragging() {
     // console.log("dragging = " + this.dragging)
     this.dragging = true;
  }

  menuOpened() {
    console.log("menuOpened()")
  }

  protected readonly console = console;

  doZoom(positif: number, index: number) {
    let delta = 20
    if (positif < 0) {
      delta *= -1
    }
    if (index == 13) {
      this.pcsDto13.width = this.pcsDto13.width + delta
      this.pcsDto13.height = this.pcsDto13.height + delta
      this.pcsDto13 = new UIPcsDto({
        ...this.pcsDto13
      })
      // console.log(this.pcsDto13.uiMusaic)
    } else {
      this.pcsDto42.width = this.pcsDto42.width + delta
      this.pcsDto42.height = this.pcsDto42.height + delta
      this.pcsDto42 = new UIPcsDto({
        ...this.pcsDto42
      })
    }
  }

  toggleRounded(index: number) {
    if (index == 13) {
      this.pcsDto13.uiMusaic.rounded = !this.pcsDto13.uiMusaic.rounded
      this.pcsDto13 = new UIPcsDto({
        ...this.pcsDto13
      })
      // console.log(this.pcsDto13.uiMusaic)
    } else {
      this.pcsDto42.uiMusaic.rounded = !this.pcsDto42.uiMusaic.rounded
      this.pcsDto42 = new UIPcsDto({
        ...this.pcsDto42
      })
    }
  }
}
