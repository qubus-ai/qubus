import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { IpcRequest } from '../ipc-request';
import { IpcChannel } from 'backend/commons';
import { Project } from './model/project';
import { Observable, from, of, ReplaySubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { SettingsService } from '../settings.service';
import { join } from '../commons/path-utils';
import { TaskService } from './task.service';
import { CrudService } from './model/crud-service';


@Injectable({
  providedIn: 'root'
})
export class ProjectService extends CrudService<Project> {

  protected onGet(): Observable<Project[]> {
    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_FILE, this.projectFile)).pipe(map(response => {
      let data = JSON.parse(response);
      return this.items = data.map(d => {
        return new Project(d);
      })
    }), catchError(() => {
      this.items = new Array<Project>();
      return of(this.items);
    }))
  }

  protected onSave(item: Project): Observable<boolean> {
    this.items.push(item);
    return from(this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.items)))
    .pipe(catchError(() => {
      this.items.pop();
      return of(false);
    }))
  }

  protected onDelete(item: Project): Observable<boolean> {
    let index = this.items.findIndex(project => {
      return project.path == item.path;
    });
    this.items.splice(index, 1);
    return from(this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.items)))
      .pipe(catchError(() => {
        this.items.splice(index, 0, item);
        return of(false);
      })
      )
  }

  protected onUpdate(item: Project): Observable<boolean> {
    let index = this.items.findIndex(item => { return item.path == item.path });
    let oldProject = this.items[index];
    this.items.splice(index, 1, item);

    return from((this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.items))))
      .pipe(catchError(() => {
        this.items.splice(index, 1, oldProject);
        return of(true);
      }))
  }

  projectFile: string;

  constructor(private electronService: ElectronService,
              private ipcRequest: IpcRequest,
              private settingsService: SettingsService,
              private taskService: TaskService) {
    super();
    this.projectFile = join(this.electronService.remote.app.getPath('userData'), 'projects.json');
  }


  async getByIndex(index: number){
    if(!this.items || !this.items[index])
    {
      this.items = await this.get().toPromise();
    }
    return this.items[index];
  }

  async getByPath(path: string)
  {
    if(!this.items)
    {
      this.items = await this.get().toPromise();
    }
    let found = this.items.find(project => {
      return project.path == path;
    })
    return found;
  }

  isProjectDuplicated(path: string): boolean {
    if (!this.items) return false;
    let found = this.items.find(item => {
      return item.path == path;
    });

    if (found) return true;
    return false;
  }

  async initializeProject(project: Project) {
    console.log("++++", project.path);
    let started = await this.startProject(project.path).toPromise();

    if (started) {
      this.taskService.runTask<string>("Scan", project, this.scanProject(project.path), this.postScanned(project));
    }
  }

  private startProject(path: string): Observable<boolean> {

    let useGm: String = String(this.settingsService.settings.gm);
    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.DYNAMIC_LIST, path, useGm.toString())).pipe(map(response => {
      return true;
    }), catchError(() => {
      return of(false);
    }));
  }

  private scanProject(path: string) {
    let useGm: String = String(this.settingsService.settings.gm);
    return this.ipcRequest.sendIpcRequestProgress<string, string>(IpcChannel.DYNAMIC_INIT, path, useGm.toString());
  }

  postScanned(project: Project) {
    project.initialized = true;

    return this.update(project);
  }

}
