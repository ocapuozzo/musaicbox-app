import { Component } from '@angular/core';
import {GroupAction} from "../../core/GroupAction";
import {Group} from "../../core/Group";
import {MusaicComponent} from "../../component/musaic/musaic.component";

@Component({
  selector: 'app-the88',
  standalone: true,
  imports: [
    MusaicComponent
  ],
  templateUrl: './the88.component.html',
  styleUrl: './the88.component.css'
})
export class The88Component {
   group88 = GroupAction.predefinedGroupsActions(12,Group.MUSAIC)
   musaicDrawGrid: boolean = false
}
