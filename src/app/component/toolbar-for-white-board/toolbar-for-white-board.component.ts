import {Component, inject, Input} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";
import {ManagerToolbarService} from "../../service/manager-toolbar.service";
import {MatTooltip} from "@angular/material/tooltip";
import {TDirection} from "../../core/IPcs";
import {HtmlUtil} from "../../utils/HtmlUtil";
import {MatBadge} from "@angular/material/badge";

@Component({
  selector: 'app-toolbar-for-white-board',
  standalone: true,
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatBadge
  ],
  templateUrl: './toolbar-for-white-board.component.html',
  styleUrl: './toolbar-for-white-board.component.css'
})
export class ToolbarForWhiteBoardComponent {
  @Input()  isShown = true;

  managerPageWBService = inject(ManagerPageWBService)
  managerToolbarService = inject(ManagerToolbarService)

  get numberSelectedComponents(): number {
    return this.managerPageWBService.getSelectedPcsDtoIndexes().length
  }

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

  doChangeViewClock() {
    this.managerPageWBService.doUpdateDrawer('Clock')
  }

  doChangeViewScore() {
    this.managerPageWBService.doUpdateDrawer('Score')
  }

  doChangeViewMusaic() {
    this.managerPageWBService.doUpdateDrawer('Musaic')
  }

  doChangeViewOctotrope() {
    this.managerPageWBService.doUpdateDrawer('Octotrope')
  }

  doTranspose(k : number) {
    this.managerPageWBService.doTranspose(k)
  }

  doAffine(a: number, k: number) {
    this.managerPageWBService.doTransformAffine(a,k)
  }

  doChangePivot(d:TDirection) {
    this.managerPageWBService.doChangePivot(d)
  }

  doComplement() {
    this.managerPageWBService.doComplement()
  }

  protected readonly HtmlUtil = HtmlUtil;

  getNumberComponentsSelected() {
    return this.managerPageWBService.getSelectedPcsDtoIndexes().length
  }
}
