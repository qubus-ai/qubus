import { Component, OnInit, Inject } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GitInfoService } from './git-info.service';

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.css']
})
export class AboutDialogComponent implements OnInit {

  electron: string;
  chrome: string;
  node: string;
  v8: string;
  os: string;
  commit: string;

  constructor(public dialogRef: MatDialogRef<AboutDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data,
              private electronService: ElectronService,
    private gitInfoService: GitInfoService) { }

  ngOnInit() {
    this.electron = this.electronService.remote.process.versions.electron;
    this.chrome = this.electronService.remote.process.versions.chrome;
    this.node = this.electronService.remote.process.versions.node;
    this.v8 = this.electronService.remote.process.versions.v8;
    this.commit = this.gitInfoService.getCommit();
  }

  homepage()
  {
    this.electronService.shell.openExternal('https://qubus.netlify.com');
  }
}
