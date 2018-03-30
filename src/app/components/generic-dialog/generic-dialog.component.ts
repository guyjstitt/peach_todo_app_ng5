import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'generic-dialog',
  templateUrl: 'generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.scss']
})
export class GenericDialogComponent {

  private dialogRef: MatDialogRef<GenericDialogComponent>;
  public data: any;

  constructor(dialogRef: MatDialogRef<GenericDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any) {

    this.dialogRef = dialogRef;
    this.data = data;

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
