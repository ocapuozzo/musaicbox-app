import {afterNextRender, AfterViewInit, Component, ElementRef, inject, Injector, ViewChild} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IDialogDataSaveFreeText} from "./IDialogDataSaveFreeText";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {MatOption, MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-dialog-free-text',
  standalone: true,
  imports: [
    MatButton,
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
export class DialogFreeTextComponent implements AfterViewInit{
  @ViewChild('inputFreeText', {static: false})inputFreeText : ElementRef<HTMLTextAreaElement>;

  readonly dialogRef = inject(MatDialogRef<DialogFreeTextComponent>)
  private _injector = inject(Injector);

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('fontSize') fontSize: ElementRef<HTMLSelectElement>//  CdkMenuItemSelectable;

  data = inject<IDialogDataSaveFreeText>(MAT_DIALOG_DATA);

  ngAfterViewInit(): void {
  }

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
