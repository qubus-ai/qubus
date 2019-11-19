import { Component, OnInit, OnDestroy } from '@angular/core';
import { Map, View } from 'ol';
import { Tile } from 'ol/layer';
import * as OSM from 'ol/source/OSM';
import { Subscription, timer } from 'rxjs';
import { SettingsService } from 'src/app/settings.service';
import { Project } from 'src/app/project/model/project';
import { ProjectFormState } from 'src/app/project/model/state';
import { MatDialog } from '@angular/material';
import { ProjecFormComponent } from 'src/app/project/projec-form/projec-form.component';
import { ProjectService } from 'src/app/project/project.service';
import { ToastService } from 'src/app/toast/toast.service';

import { Mapy } from '../../image/map';
import { ImageService } from 'src/app/image/image.service';
import { ImageSize, ImageHorizontalPlacement, ImageVerticalPlacement } from 'src/app/image/image-view/image-view.component';
import { debounce } from 'rxjs/operators';
import { Image } from 'src/app/image/model/image';
import { ActiveProjectService } from 'src/app/active-project.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {

  private mapy: Mapy;

  ImageSize = ImageSize;
  ImageHorizontalPlacement = ImageHorizontalPlacement;
  ImageVerticalPlacement = ImageVerticalPlacement;

  previewImage: Image;
  previewAnchor: number[];

  onFeatureHoverSub: Subscription;
  onFeatureClickSub: Subscription;
  
  constructor(private projectService: ProjectService,
              public dialog: MatDialog,
              private toastService: ToastService,
              private imageService: ImageService,
              private settingsService: SettingsService,
              private activeProject: ActiveProjectService) { 
                this.mapy = new Mapy();
              }

  async ngOnInit() {
  
    this.mapy.initialize('map');

    this.activeProject.getActiveImage().subscribe(data =>{
      if(!data || !data.image ) return;
      console.log("----- setActiveFeature");
      this.mapy.setActiveFeature(data.image.position);
    })


    this.onFeatureHoverSub = this.mapy.onFeatureHover.pipe(debounce(()=>timer(1000))).subscribe( data => {
      if (data) {
        this.previewImage = data.image;
        this.previewAnchor = data.pixel;
      }
      else {
        this.previewImage = null;
      }
    })

    this.onFeatureClickSub = this.mapy.onFeatureClick.subscribe(data => {
      if(!data) return;
      this.activeProject.selectImage(data.image);
      this.previewImage = null;
    })

    

    let projects = await this.projectService.get().toPromise();

    projects.forEach(project => {
      this.imageService.getFeatureCollection(project.path).subscribe(features =>{
        this.mapy.addFeatureCollection(project.path, features);
        this.imageService.getFeatureUpdate(project.path).subscribe(feature => {
          this.mapy.addFeature(project.path, feature);
        })
      })
    })
  }

  ngOnDestroy(): void {
    this.onFeatureHoverSub && this.onFeatureHoverSub.unsubscribe();
    this.onFeatureClickSub && this.onFeatureClickSub.unsubscribe();
  }

  getPreviewStyle() {
    return { 'top': (this.previewAnchor[1] - 30) + 'px', 'left': (this.previewAnchor[0] + 10) + 'px' }
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
        this.projectService.insert(project).subscribe(async response => {
          if (response) {
            this.toastService.success("Project created successfully!");
            this.projectService.initializeProject(project);
            let a = await this.sleep(5000);
            let fatures =  await this.imageService.getFeatureCollection(project.path).toPromise();

            this.mapy.addFeatureCollection(project.path, fatures);
            this.imageService.getFeatureUpdate(project.path).subscribe(feature => {
              this.mapy.addFeature(project.path, feature);
            })
          }
          else {
            this.toastService.danger("Project creation failed!");
          }
        })
      }
    });
  }


  sleep(time: number)
  {
    return new Promise(resovle =>{
      setTimeout(resovle, time);
    })
  }
}
