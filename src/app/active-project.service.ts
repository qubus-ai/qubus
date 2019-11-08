import { Injectable } from '@angular/core';
import { ImageService } from './image/image.service';
import { Project, ImageSortType } from './project/model/project';
import { Image } from './image/model/image';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { TaskService } from './project/task.service';
import { FeatureCollection, Feature, Point } from 'geojson';

export interface ActiveImageInterface {
  image: Image;
  index: number;
  [key: string]: any
};


@Injectable({
  providedIn: 'root'
})
export class ActiveProjectService {

  //project: Project;
  //images: Image[];
  //featureCollection: FeatureCollection;

  private activeImageSubject: BehaviorSubject<ActiveImageInterface>;
  private activeImage: ActiveImageInterface;
  //private activeImageIndex: number = -1;

  constructor(private imageService: ImageService,
    private taskService: TaskService) {
    this.activeImageSubject = new BehaviorSubject<ActiveImageInterface>(null);
    this.activeImage = null;
  }

  /*open(project: Project): Observable<boolean> {
    this.close();
    this.project = project;
    
    return this.imageService.getAll(this.project.path).pipe(map(images => {
      this.images = images;
      this.featureCollection = this.imageService.getJson();

      this.sortImage(this.project.imageSortType);
      this.selectDefaultImage();

      let task = this.taskService.getTask(project);
      if (task) {
        task.stream.subscribe(data => {
          let feature = <Feature>JSON.parse(data);
          this.updateFeature(feature);
          this.updateImage(feature);
        })
      }
      return true;
    }));
  }*/

  close() {
    //this.project = null;
    //this.images = null;
    //this.activeImageIndex = -1;
    this.activeImage.next(null);
  }

  /*selectImageByName(name: string, key?: string, value?: any) {
    let index = this.images.findIndex(item => { return item.name == name });
    this.selectImageByIndex(index, key, value);
  }*/

  private setActiveImage(activeImage: ActiveImageInterface)
  {
    this.activeImage = activeImage;
    this.activeImageSubject.next(activeImage);
  }


  async selectImage(image: Image, attribute?: [string, any]) {
    let images = await this.imageService.getImages(image.path).toPromise();
    let index = images.findIndex(item => { return item.name == image.name })
    let active = { image: image, index: index }
    if(attribute){
      active[attribute[0]] = attribute[1];
    }
    this.setActiveImage(active);
  }

  async selectImageByName(projectName: string, imageName:string, attribute?: [string, any])
  {
    let images = await this.imageService.getImages(projectName).toPromise();
    let index = images.findIndex(item => { return item.name == imageName })
    let active = { image: images[index], index: index }
    if(attribute){
      active[attribute[0]] = attribute[1];
    }
    this.setActiveImage(active);
  }

  async selectImageByIndex(projectName:string, index: number, attribute?: [string, any]) {
    let images = await this.imageService.getImages(projectName).toPromise();
    let active = { image: images[index], index: index };
    if(attribute){
      active[attribute[0]] = attribute[1];
    }
    this.setActiveImage(active);
  }

  async selectNext(projectName: string, attribute?: [string, any]) {
    let images = await this.imageService.getImages(projectName).toPromise();
    let index = this.activeImage.index + 1;
    if(index >= images.length) {
      index = 0;
    }
    this.selectImageByIndex(projectName, index, attribute);
  }

  async selectPrevious(projectName: string, attribute?: [string, any]) {
    let images = await this.imageService.getImages(projectName).toPromise();
    let index = this.activeImage.index - 1;
    if (index < 0) {
      index = images.length - 1;
    }
    this.selectImageByIndex(projectName, index, attribute);
  }
/*
  selectImageByName(name: string, key?: string, value?: any) {
    let index = this.images.findIndex(item => { return item.name == name });
    this.selectImageByIndex(index, key, value);
  }

  selectImage(image: Image, key?: string, value?: any) {
    let index = this.images.findIndex(item => { return item.name == image.name })
    this.selectImageByIndex(index, key, value);
  }

  selectImageByIndex(index: number, key?: string, value?: any) {
    this.activeImageIndex = index;
    let data = { image: this.images[index] };
    data[key] = value;
    this.activeImage.next(data);
  }

  selectNext(key?: string, value?: any) {
    this.activeImageIndex++;
    if(this.activeImageIndex >= this.images.length) {
      this.activeImageIndex = 0;
    }
    let data = { image: this.images[this.activeImageIndex] };
    data[key] = value;
    this.activeImage.next(data);
  }

  selectPrevious(key?: string, value?: any) {
    this.activeImageIndex--;
    if (this.activeImageIndex < 0) {
      this.activeImageIndex = this.images.length - 1;
    }
    let data = { image: this.images[this.activeImageIndex] };
    data[key] = value;
    this.activeImage.next(data);
  }
*/
  getActiveImage(): Observable<ActiveImageInterface> {
    return this.activeImageSubject.asObservable();
  }

  /*private sortImage(imageSortType: ImageSortType):void
  {
    switch (+imageSortType) {
      case ImageSortType.DATE:
        this.images = this.images.sort((a, b) => {
          return a.date < b.date ? -1 : 1;
        })
        break;
      case ImageSortType.NAME:
        this.images = this.images.sort((a, b) => {
          return a.name.localeCompare(b.name);
        })
        break;
    }
  }

  private updateFeature(feature: Feature):void
  {
    let found = this.featureCollection.features.find(item => {
      return item.properties.name == feature.properties.name;
    });
    if (found) {
      found.geometry = feature.geometry;
      found.properties = feature.properties;
    }
  }

  private updateImage(feature: Feature):void
  {
    let image = this.images.find(i => {
      return i.name == feature.properties.name;
    })
    if (image) {
      let point = feature.geometry as Point;
      image.position = point.coordinates;
    }
  }*/

  /*private selectDefaultImage():void {
    let feature = this.featureCollection.features.find(f => {
      let point = f.geometry as Point;
      if (point.coordinates[0] != 0 && point.coordinates[1] != 0) {
        return true;
      }
      return false;
    })

    if (feature) {
      this.selectImageByName(feature.properties.name);
    }
  }*/
}
