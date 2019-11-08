import { Injectable } from '@angular/core';
import { Image } from './model/image';
import { IpcRequest } from '../ipc-request';
import { IpcChannel } from 'backend/commons';
import { Observable, from, of, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExifData } from 'exif';
import { FeatureCollection, Feature, Point } from 'geojson';
import { TaskService } from '../project/task.service';




class Cache<T, D> {

  data: T;
  update: ReplaySubject<D>;

  constructor(data: T)
  {
    this.data = data;
    this.update = new ReplaySubject<D>();
  }

}

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: Image[];

  private geoJson: FeatureCollection;

  private featureCache = new Map<string, Cache<FeatureCollection, Feature>>();
  private imageCache = new Map<string, Cache<Image[], Image>>();

  constructor(private ipcRequest: IpcRequest, private taskService: TaskService) {
  }

  getJson() {
    return this.geoJson;
  }

  getAll(filename: string): Observable<Image[]> {
    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_FILE, filename + '/images.json')).pipe(map(response => {
      let data = JSON.parse(response);
      this.geoJson = data;
      return this.images = data.features.map(img => {
        let image = new Image(img.properties);
        image.position = img.geometry.coordinates;
        return image;
      })
    }))
  }

  clearCache() {
    this.featureCache.clear();
    this.imageCache.clear();
  }

  getImageUpdate(name: string): ReplaySubject<Image>
  {
    return this.imageCache.get(name).update;
  }

  getFeatureUpdate(name: string): ReplaySubject<Feature>
  {
    return this.featureCache.get(name).update;
  }

  updateFeature(filename: string) {
    let task = this.taskService.getTaskByName(filename);
    if (task) {
      let cache = this.featureCache.get(filename);
      if (cache) {
        task.stream.subscribe(data => {
          let feature = <Feature>JSON.parse(data);
          let featureCollection = cache.data;
          let found = featureCollection.features.find(item => {
            return item.properties.name == feature.properties.name;
          });
          if (found) {
            found.geometry = feature.geometry;
            found.properties = feature.properties;
          }
          cache.update.next(found);
        })
      }
    }
  }

  private updateImage(filename: string): void {
    let task = this.taskService.getTaskByName(filename);
    if (task) {
      let cache = this.imageCache.get(filename);
      if (cache) {
        task.stream.subscribe(data => {
          let feature = <Feature>JSON.parse(data);
          let image = cache.data.find(i => {
            return i.name == feature.properties.name;
          })
          if (image) {
            let point = feature.geometry as Point;
            image.position = point.coordinates;
          }
          cache.update.next(image);
        })
      }
    }
  }


  getFeatureCollection(filename: string): Observable<FeatureCollection> {
    let featureCache = this.featureCache.get(filename);
    if (featureCache) {
      return of(featureCache.data);
    }
    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_FILE, filename + '/images.json')).pipe(map(response => {
      let features = <FeatureCollection>JSON.parse(response);
      let cache = new Cache<FeatureCollection, Feature>(features);
      this.featureCache.set(filename, cache);
      this.updateFeature(filename);
      return features;
    }))
  }

  getImages(filename: string): Observable<Image[]> {
    let imageCache = this.imageCache.get(filename);
    if (imageCache) {
      return of(imageCache.data);
    }

    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_FILE, filename + '/images.json')).pipe(map(response => {
      let data = JSON.parse(response);
      let images = data.features.map(img => {
        let image = new Image(img.properties);
        image.position = img.geometry.coordinates;
        return image;
      });
      let cache = new Cache<Image[], Image>(images);
      this.imageCache.set(filename, cache);
      this.updateImage(filename);
      return images;
    }))
  }

  getExif(image: Image): Observable<ExifData> {
    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_EXIF, image.path + '/' + image.name)).pipe(map(response => {
      return <ExifData>JSON.parse(response);
    }))
  }

}
