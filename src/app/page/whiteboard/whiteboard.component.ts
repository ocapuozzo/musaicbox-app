import { Component } from '@angular/core';
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {ClockComponent} from "../../component/clock/clock.component";
import {Clock2Component} from "../../component/clock2/clock2.component";
import {Clock3Component} from "../../component/clock2/clock3.component";
import {Musaic3Component} from "../../component/musaic/musaic3.component";

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle,
    ClockComponent,
    Clock2Component,
    Clock3Component,
    Musaic3Component
  ],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.css'
})
export class WhiteboardComponent {
  pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[87].getPcsMin()
  pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[38].getPcsMin().complement().modalPrimeForm()
  sizes = [{ w:180, h:180 }, { w:117, h:117 }];

  doClick(event: any, index: number) {
    if (event.ctrlKey) {
      if (this.sizes[index].w === 299) {
        this.sizes[index] = {w: 143, h: 143}
      } else {
        this.sizes[index] = {w: 299, h: 299}
      }
    }
  }

}
