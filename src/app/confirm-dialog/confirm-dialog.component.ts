import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface ConfirmDialogInterface
{
  title: string
  text: string,
  cancelLabel?: string,
  acceptLabel?: string
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  cancelLabel: string;
  acceptLabel: string;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogInterface) { 
      this.cancelLabel = data.cancelLabel || "Cancel";
      this.acceptLabel = data.acceptLabel || "Accept";
    }

  ngOnInit() {
  }
}
