import { Injectable } from '@angular/core';
import { from, Observable, of, BehaviorSubject } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { IpcRequest } from './ipc-request';
import { IpcChannel } from 'backend/commons';
import { tap, catchError } from 'rxjs/operators';
import { join } from './commons/path-utils';

export class Settings
{
  gm: boolean;
  imageSize: boolean;
  map: string;

  constructor(options: {gm: boolean, imageSize: boolean, map: string})
  {
    this.gm = options.gm;
    this.imageSize = options.imageSize;
    this.map = options.map;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settings: Settings = null;
  settingsFile: string;

  settingsSubject: BehaviorSubject<Settings>

  constructor(private electronService: ElectronService,
              private ipcRequest: IpcRequest) {

    this.settingsSubject = new BehaviorSubject<Settings>(null);

    this.settingsFile = join(this.electronService.remote.app.getPath('userData'), 'settings.json') ;
   
    let response = this.ipcRequest.sendIpcRequestSync<string, string>(IpcChannel.READ_FILE_SYNC, this.settingsFile);

    if(!response.error)
    {
      this.settings = new Settings(JSON.parse(response.data));
    }
  }

  update(settings: Settings): Observable<boolean>
  {

    let oldSettings = this.settings;
    this.settings = settings
    return from(this.ipcRequest.sendIpcRequest<string,boolean>(IpcChannel.WRITE_FILE, this.settingsFile, JSON.stringify(settings)))
    .pipe(tap(response => { this.settingsSubject.next(this.settings)}), catchError(() =>{
      this.settings = oldSettings;
      return of(false);
    }))
  }

  settingsChanged(): Observable<Settings>
  {
    return this.settingsSubject.asObservable();
  }
}
