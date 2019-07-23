import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { IpcRequest } from './ipc-request';
import { IpcChannel } from 'backend/commons';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { join } from './commons/path-utils';

export class MapLayer {
  name: string;
  url: string;

  constructor(options: { name: string, ulr: string }) {
    this.name = options.name || '';
    this.url = options.ulr || '';
  }
}

let defaultMapLayers = [{ name: 'Mapnik', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' },
{ name: "HOT", url: 'https://tile.openstreetmap.fr/hot/{z}/{x}/{z}.png' },
{ name: "BZH", url: 'https://tile.openstreetmap.bzh/br/{z}/{x}/{z}.png' },
{ name: "BZH", url: 'https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png' },
{ name: "Stanem", url: 'http://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png' }]


@Injectable({
  providedIn: 'root'
})
export class MapLayerService {

  private mapLayerFile: string;
  private mapLayers: MapLayer[];

  constructor(private electronService: ElectronService,
              private ipcRequest: IpcRequest) {

    this.mapLayerFile = join(this.electronService.remote.app.getPath('userData'), 'mapLayers.json');

    let response = this.ipcRequest.sendIpcRequestSync<string, string>(IpcChannel.READ_FILE_SYNC, this.mapLayerFile);

    if (response.error) {
      this.mapLayers = defaultMapLayers;
      let data = JSON.stringify(this.mapLayers);
      this.ipcRequest.sendIpcRequestSync<string, string>(IpcChannel.WRITE_FILE_SYNC, this.mapLayerFile, data);
    }
    else {
      let layers = JSON.parse(response.data);
      this.mapLayers = layers.map(layer => {
        return new MapLayer(layer);
      });
    }
  }

  getLayers(): MapLayer[] {
    return this.mapLayers;
  }

  insert(layer: MapLayer): Observable<boolean> {
    let index = this.mapLayers.findIndex((l) => {
      return l.url == layer.url;
    });
    if (index == -1) {
      return of(false);
    }

    this.mapLayers.push(layer);

    return from(this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.mapLayerFile, JSON.stringify(this.mapLayers)))
      .pipe(catchError(() => {
        this.mapLayers.pop();
        return of(false);
      }))

  }
}
