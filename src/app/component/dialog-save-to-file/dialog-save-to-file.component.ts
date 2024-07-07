import {ChangeDetectionStrategy, Component, inject, model, signal} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatCheckbox} from "@angular/material/checkbox";

// export interface DialogData {
//   fileName: string;
//   withDateInFileName : boolean;
// }

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
  readonly fileName = signal('my-project');
  readonly withDateInFileName = signal(true);
  readonly dialog = inject(MatDialogRef<DialogSaveToFileComponent>);
  dataDialog = {fileName: this.fileName, withDateInFileName: this.withDateInFileName};

  onNoClick(): void {
    this.dialog.close();
  }

}
