import {ChangeDetectionStrategy, Component, inject, model} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatCheckbox} from "@angular/material/checkbox";
import {IDialogDataSaveToFile} from "./IDialogDataSaveToFile";


// https://material.angular.io/components/dialog/overview

@Component({
  selector: 'app-dialog-save-to-file',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatCheckbox, MatDialogActions, MatDialogContent, MatDialogTitle, MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-save-to-file.component.html',
  styleUrl: './dialog-save-to-file.component.css'
})
export class DialogSaveToFileComponent {
  readonly dialogRef = inject(MatDialogRef<DialogSaveToFileComponent>)

  data = inject<IDialogDataSaveToFile>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }

}
