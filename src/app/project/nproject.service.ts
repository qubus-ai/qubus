import { CrudService } from "./model/crud-service";
import { Project } from './model/project';
import { from, of, Observable } from 'rxjs';
import { IpcChannel } from 'backend/commons';
import { map, catchError } from 'rxjs/operators';
import { join } from 'path';
import { ElectronService } from 'ngx-electron';
import { IpcRequest } from '../ipc-request';
import { SettingsService } from '../settings.service';
import { TaskService } from './task.service';

class NprojectService extends CrudService<Project>{
    projectFile: string;


    constructor(private electronService: ElectronService,
        private ipcRequest: IpcRequest,
        private settingsService: SettingsService,
        private taskService: TaskService) {
          super();
          this.projectFile = join(this.electronService.remote.app.getPath('userData'), 'projects.json');
}


    get(): Observable<Project> {
        return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_FILE, this.projectFile)).pipe(map(response => {
            let data = JSON.parse(response);
            return this.items = data.map(d => {
              return new Project(d);
            })
          }), catchError(() => {
            return of(null);
          }))
    }    
    
    onSave(item: Project): Observable<boolean> {
        this.items.push(item);
        return from(this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.items)))
          .pipe(catchError(() => {
            this.items.pop();
            return of(false);
          }))
    }

    onDelete(item: Project): import("rxjs").Observable<boolean> {
        let index = this.items.findIndex(el => { return el.path == item.path });
        this.items.splice(index, 1);
        return from(this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.items)))
          .pipe(catchError(() => {
            this.items.splice(index, 0, item);
            return of(false);
          })
          )
    }

    onUpdate(item: Project): Observable<boolean> {
        let index = this.items.findIndex(el => { return el.path == item.path });
        let oldProject = this.items[index];
        this.items.splice(index, 1, item);
        return from((this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.items))))
          .pipe(catchError(() => {
            this.items.splice(index, 1, oldProject);
            return of(true);
          }))
    }    
}