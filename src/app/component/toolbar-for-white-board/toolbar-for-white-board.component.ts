import {Component, inject, Input} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";
import {ManagerToolbarService} from "../../service/manager-toolbar.service";

@Component({
  selector: 'app-toolbar-for-white-board',
  standalone: true,
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './toolbar-for-white-board.component.html',
  styleUrl: './toolbar-for-white-board.component.css'
})
export class ToolbarForWhiteBoardComponent {
  @Input()  isShown = false;

  managerPageWBService = inject(ManagerPageWBService)
  managerToolbarService = inject(ManagerToolbarService)

  hideToolBar() {
    this.managerToolbarService.toggleShowToolbar()
    // no subscribe, so get directly get value of manager
    this.isShown = this.managerToolbarService.isToolbarShown
  }

  toggleRetract() {
    this.isShown = !this.isShown;
  }

  zoomIn() {
    this.managerPageWBService.doZoom(1)
  }

  zoomOut() {
    this.managerPageWBService.doZoom(-1)
  }

  delete() {
    this.managerPageWBService.doDelete()
  }


}
