import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { IpcRequest } from '../ipc-request';
import { IpcChannel } from 'backend/commons';
import { Project } from './model/project';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { SettingsService } from '../settings.service';
import { join } from '../commons/path-utils';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  projectFile: string;
  projects: Array<Project> = [];

  constructor(private electronService: ElectronService,
              private ipcRequest: IpcRequest,
              private settingsService: SettingsService,
              private taskService: TaskService) {

    this.projectFile = join(this.electronService.remote.app.getPath('userData'), 'projects.json');
  }

  getAll(): Observable<Project[]> {
    return from(this.ipcRequest.sendIpcRequest<string, string>(IpcChannel.READ_FILE, this.projectFile)).pipe(map(response => {
      let data = JSON.parse(response);
      return this.projects = data.map(d => {
        return new Project(d);
      })
    }), catchError(() => {
      return of(this.projects);
    }))
  }

  get(index: number): Project {
    return this.projects[index];
  }

  isProjectDuplicated(path: string): boolean {
    if (!this.projects) return false;
    let found = this.projects.find(item => {
      return item.path == path;
    });

    if (found) return true;

    return false;
  }

  insert(p: Project): Observable<boolean> {
    this.projects.push(p);

    return from(this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.projects)))
      .pipe(catchError(() => {
        this.projects.pop();
        return of(false);
      }))

  }

  async initializeProject(project: Project) {
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

  remove(index: number): Observable<boolean> {
    let project = this.projects[index];
    this.projects.splice(index, 1);
    return from(this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.projects)))
      .pipe(catchError(() => {
        this.projects.splice(index, 0, project);
        return of(false);
      })
      )
  }

  update(project: Project): Observable<boolean> {
    let index = this.projects.findIndex(item => { return item.path == project.path });
    let oldProject = this.projects[index];
    this.projects.splice(index, 1, project);

    return from((this.ipcRequest.sendIpcRequest<string, boolean>(IpcChannel.WRITE_FILE, this.projectFile, JSON.stringify(this.projects))))
      .pipe(catchError(() => {
        this.projects.splice(index, 1, oldProject);
        return of(true);
      }))
  }
}
