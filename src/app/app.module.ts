import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { MaterialModule } from './material.module';
import { IpcRequest } from './ipc-request';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ProjectModule } from './project/project.module';
import { ToastModule } from './toast/toast.module';
import { ImageModule } from './image/image.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

import { MapsModule } from './maps/maps.module';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    AboutDialogComponent,
    SettingsDialogComponent,
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ProjectModule,
    ImageModule,
    ToastModule,
    ReactiveFormsModule,
    MapsModule
  ],
  providers: [IpcRequest],
  entryComponents: [ConfirmDialogComponent, AboutDialogComponent, SettingsDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
