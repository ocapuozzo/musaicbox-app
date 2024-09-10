import {Component, OnInit, Inject, inject} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions
} from '@angular/material/dialog';
import {MatButton} from "@angular/material/button";
import {ManagerPageWBService} from "../../service/manager-page-wb.service";

@Component({
  selector: 'app-dialog-confirmation',
  templateUrl: './dialog-confirmation.component.html',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton
  ],
  styleUrls: ['./dialog-confirmation.component.css']
})
export class DialogConfirmationComponent implements OnInit {
  private managerPageWBService = inject(ManagerPageWBService);

  constructor(
    public dialog: MatDialogRef<DialogConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string) { }

  cancelDialog(): void {
    this.dialog.close(false);
  }
  confirm(): void {
    this.dialog.close(true);
  }

  ngOnInit() {
  }

  // user can save content before clea content
  saveBefore() {
    this.managerPageWBService.doOpenDialogAndSaveContentToFile()
    this.dialog.close(2);  // 2 : pass a number for differentiate with a boolean
    // see doClearContentSaveAndEmit() of whiteboard component
  }
}
