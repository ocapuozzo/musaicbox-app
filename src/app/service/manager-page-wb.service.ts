import {EventEmitter, Injectable, Output} from '@angular/core';
import {UIPcsDto} from "../ui/UIPcsDto";
import {ManagerLocalStorageService} from "./manager-local-storage.service";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";

@Injectable({
  providedIn: 'root'
})
export class ManagerPageWBService {

  pcs1 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[87].getPcsMin()
  pcs2 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[38].getPcsMin().complement().modalPrimeForm()
  pcs3 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC).orbits[36].getPcsMin().complement().modalPrimeForm()

  uiPcsDtoList : UIPcsDto[] = [
    new UIPcsDto({pcs:this.pcs1}),
    new UIPcsDto({pcs:this.pcs2}),
    new UIPcsDto({pcs:this.pcs3})
  ]

  @Output() eventChangePcsPdoList : EventEmitter<UIPcsDto[]> = new EventEmitter();

  constructor(private managerLocalStorageService : ManagerLocalStorageService) { }

  add(pcsDto : UIPcsDto) {
    this.uiPcsDtoList.push(pcsDto)
    this.managerLocalStorageService.savePageWB(this.uiPcsDtoList)
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  delete(uiPcsDtoID: string) {
    this.uiPcsDtoList = this.uiPcsDtoList.filter(({ id }) => id !== uiPcsDtoID);
    this.managerLocalStorageService.savePageWB(this.uiPcsDtoList)
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  update(uiPcsDtoID: string, pcsDtoUpdate: UIPcsDto) {
    this.uiPcsDtoList = this.uiPcsDtoList.map(pcsDto =>
      pcsDto.id === uiPcsDtoID
        ? new UIPcsDto({
          ...pcsDto,
          ...pcsDtoUpdate
        })
        : pcsDto
    );
    this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }

  refresh() {
    // this.eventChangePcsPdoList.emit(this.uiPcsDtoList)
  }
}
