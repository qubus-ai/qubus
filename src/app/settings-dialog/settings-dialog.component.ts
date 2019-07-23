import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ElectronService } from 'ngx-electron';
import { SettingsService, Settings } from '../settings.service';
import { ToastService } from '../toast/toast.service';
import { MapLayer, MapLayerService } from '../map-layer.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit {

  settingsForm: FormGroup;
  mapLayers: MapLayer[];

  constructor(public dialogRef: MatDialogRef<SettingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public settings: Settings, 
              private fb: FormBuilder,
              private electronService: ElectronService,
              private settingService: SettingsService,
              private toastService: ToastService,
              private mapLayerService: MapLayerService) {

    this.mapLayers = this.mapLayerService.getLayers();

    this.settingsForm = this.fb.group({
      gm: [false],
      map: ['http://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png']
    });

    if (settings) {
      this.settingsForm.patchValue(settings);
    }
  }

  ngOnInit() {
  }

  openGM() {
    this.electronService.shell.openExternal("http://www.graphicsmagick.org/");
  }

  ok() {
    this.settingService.update(new Settings(this.settingsForm.value)).subscribe(response => {
      if (!response) {
        this.toastService.danger("Could not save settings");
      }
      this.dialogRef.close();
    });
  }
}
