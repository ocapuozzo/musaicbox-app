import {EventEmitter, inject, Injectable, Output} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {IDialogDataSaveFreeText} from "../component/dialog-free-text/IDialogDataSaveFreeText";
import {DialogFreeTextComponent} from "../component/dialog-free-text/dialog-free-text.component";

@Injectable({
  providedIn: 'root'
})
export class DialogUpdateFreeTextService {

  @Output() eventUpdateFreeText = new EventEmitter<string>()

  readonly dialogFreeText = inject(MatDialog);

  constructor() {
  }

  openDialogForUpdateFreeText(data: IDialogDataSaveFreeText): void {
    const dialogRef = this.dialogFreeText.open(DialogFreeTextComponent,
      {
        data:
          {
            text: data.text,
            index: data.index,
            fontSize: data.fontSize
          }
      });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed with : ', result);
      if (result !== undefined) {
        if (result) {
          this.eventUpdateFreeText.emit(result)
        }
      }
    });
  }

}
