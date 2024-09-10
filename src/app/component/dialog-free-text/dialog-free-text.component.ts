import {afterNextRender, Component, ElementRef, inject, Injector, ViewChild} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCheckbox} from "@angular/material/checkbox";
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IDialogDataSaveToFile} from "../dialog-save-to-file/IDialogDataSaveToFile";
import {IDialogDataSaveFreeText} from "./IDialogDataSaveFreeText";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {CdkMenuItemSelectable} from "@angular/cdk/menu";

@Component({
  selector: 'app-dialog-free-text',
  standalone: true,
  imports: [
    MatButton,
    MatCheckbox,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    MatDialogClose,
    CdkTextareaAutosize,
    MatSelect,
    MatOption
  ],
  templateUrl: './dialog-free-text.component.html',
  styleUrl: './dialog-free-text.component.css'
})
export class DialogFreeTextComponent {
  readonly dialogRef = inject(MatDialogRef<DialogFreeTextComponent>)
  private _injector = inject(Injector);

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('fontSize') fontSize: ElementRef<HTMLSelectElement>//  CdkMenuItemSelectable;

  data = inject<IDialogDataSaveFreeText>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }

  triggerResize() {
    // Wait for content to render, then trigger textarea resize.
    afterNextRender(
      () => {
        this.autosize.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      },
    );
  }
}
