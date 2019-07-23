import { Injectable } from '@angular/core';
import { Image } from './model/image';
import { IpcRequest } from '../ipc-request';
import { IpcChannel } from 'backend/commons';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExifData } from 'exif';
import { FeatureCollection } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: Image[];

  private geoJson: FeatureCollection;

  constructor(private ipcRequest: IpcRequest) {
  }

  getJson()
  {
    return this.geoJson;
  }

  getAll(filename: string): Observable<Image[]>
  {
      return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_FILE, filename + '/images.json')).pipe(map(response => {
        let data = JSON.parse(response);
        this.geoJson = data;
        return this.images = data.features.map(img => {
          let image =  new Image(img.properties);
          image.position = img.geometry.coordinates;
          return image;
        })
      }))
  }

  getExif(image: Image): Observable<ExifData>
  {
    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_EXIF,  image.path + '/' + image.name)).pipe(map(response => {
      return <ExifData>JSON.parse(response);
    }))
  }

}
