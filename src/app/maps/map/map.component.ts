import { Component, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import { Tile } from 'ol/layer';
import * as OSM from 'ol/source/OSM';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/settings.service';
import { Project } from 'src/app/project/model/project';
import { ProjectFormState } from 'src/app/project/model/state';
import { MatDialog } from '@angular/material';
import { ProjecFormComponent } from 'src/app/project/projec-form/projec-form.component';
import { ProjectService } from 'src/app/project/project.service';
import { ToastService } from 'src/app/toast/toast.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  map: Map;
  tileLayer = new Tile({ source: new OSM.default({ url: "" }) });

  settingsSubscription: Subscription;
  
  constructor(private projectService: ProjectService,
              public dialog: MatDialog,
              private toastService: ToastService,
              private settingsService: SettingsService) { }

  ngOnInit() {

    this.settingsSubscription = this.settingsService.settingsChanged().subscribe(setting => {
      this.setTileLayerSource();
    });

    this.map = new Map({
      target: 'map',
      layers: [this.tileLayer],
      view: new View({
        center: [60, 60],
        zoom: 6
      })
    })

    this.setTileLayerSource();
  }

  private setTileLayerSource(): void
  {
    let url = this.settingsService.settings.map || "http://stamen-tiles-c.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png";
    this.tileLayer.setSource(new OSM.default({ url: url }));
  }

  onFileDrop(file: any)
  {
    console.log("====== ", file);

    let project = new Project({path: file.path,name: 'Test'});
    let data = { project: project, state: ProjectFormState.Create }
    const dialogRef = this.dialog.open(ProjecFormComponent, {
      width: '70%', data: data
    });

    dialogRef.afterClosed().subscribe(project => {
      if (project) {
        this.projectService.insert(project).subscribe(response => {
          if (response) {
            this.toastService.success("Project created successfully!");
            this.projectService.initializeProject(project);
          }
          else {
            this.toastService.danger("Project creation failed!");
          }
        })
      }
    });
  }
}
