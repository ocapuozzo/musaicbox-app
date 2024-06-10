import {Component, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {ClockComponent} from "../../component/clock/clock.component";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {NgStyle} from "@angular/common";

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
    NgStyle
  ],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent {
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;

  pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[87].getPcsMin()
  pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[38].getPcsMin().complement().modalPrimeForm()
  pcs3 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[36].getPcsMin().complement().modalPrimeForm()
  sizes = [{ w:180, h:180 }, { w:117, h:117 },  { w:117, h:117 }];
  dragging = false;

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

  selectedMenu(index: number) {
    console.log("selected " + index)
    // let index = text.index //parseInt(text.substring(3)) - 1
    this.changeSize(index)

  }

  startDragging() {
     // console.log("dragging = " + this.dragging)
     this.dragging = true;
  }

  menuOpened() {
    console.log("menuOpened()")
  }

  protected readonly console = console;

  doNothing() {

  }
}
