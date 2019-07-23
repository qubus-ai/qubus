import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { SettingsService } from './settings.service';
import { ElectronService } from "ngx-electron";
import { TaskService } from './project/task.service';
import { ToastService } from './toast/toast.service';
import { IpcChannel } from 'backend/commons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  title = 'Qubus';

  constructor(private router: Router,
              private dialog: MatDialog,
              private settingsService: SettingsService,
              private electronService: ElectronService,
              private taskService: TaskService, 
              private toastService: ToastService) {

  }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on(IpcChannel.CLOSABLE.toString(), () => {
      if (!this.taskService.running()) {
        this.electronService.ipcRenderer.send(IpcChannel.CLOSE_WINDOW.toString(), false);
      }
      else {
        this.electronService.ipcRenderer.send(IpcChannel.CLOSE_WINDOW.toString(), true);
      }
    })
  }

  ngAfterViewInit(): void {
    if (!this.settingsService.settings) {
      setTimeout(() => {
        this.openSettings();
      }, 100);
    }
  }

  home() {
    this.router.navigateByUrl("/");
  }

  isEnabled() {
    return this.router.url.localeCompare('/projectList')
  }

  openAbout() {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: '50%'
    });
  }

  openSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '50%', data: this.settingsService.settings
    });
  }

  close() {
    this.electronService.remote.getCurrentWindow().close();
  }
}