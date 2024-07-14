import {EventEmitter, inject, Injectable, Output} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {DialogSaveToFileComponent} from "../component/dialog-save-to-file/dialog-save-to-file.component";
import {IDialogDataSaveToFile} from "../component/dialog-save-to-file/IDialogDataSaveToFile";

@Injectable({
  providedIn: 'root'
})
export class DialogSaveAsFileNameService {

  @Output() eventFileNameSetByUser = new EventEmitter<string>()

  readonly dialogSaveToFile = inject(MatDialog);

  constructor() { }

  openDialogForSaveIntoFile(dataSaveToFile : IDialogDataSaveToFile): void {
    const dialogRef = this.dialogSaveToFile.open(DialogSaveToFileComponent,
      {
        data:
          {
            fileName: dataSaveToFile.fileName,
            withDateInFileName: dataSaveToFile.withDateInFileName
          }
      });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      if (result !== undefined) {
        if (dataSaveToFile.fileName) {
          dataSaveToFile.fileName = result.fileName.trim()
          dataSaveToFile.withDateInFileName = result.withDateInFileName
          const dateNow = this.formatDateNow()
          const suffix = dataSaveToFile.withDateInFileName ? "_" + dateNow : ""
          const ext: string = '.musaicbox'
          // fileName is done, emit to subscriber
          this.eventFileNameSetByUser.emit(dataSaveToFile.fileName + suffix + ext)
        }
      }
    });
  }

  formatDateNow() {
    const d = new Date()
    let month = (d.getMonth() + 1)
    const day = d.getDate()
    const year = d.getFullYear()
    const hour = d.getHours()
    const minute = d.getMinutes()

    let month2 = month.toString()
    let day2 = day.toString()
    let hour2 = hour.toString()
    let minute2 = minute.toString()

    if (month < 10)
      month2 = '0' + month;
    if (day < 10)
      day2 = '0' + day;
    if (hour < 10)
      hour2 = '0' + day;
    if (minute < 10)
      minute2 = '0' + day;

    return [year, month2, day2, hour2, minute2].join('-');
  }

}
