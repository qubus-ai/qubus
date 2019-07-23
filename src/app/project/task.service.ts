import { Injectable } from '@angular/core';
import { Project } from './model/project';
import { Task } from './model/task';
import { ToastService } from '../toast/toast.service';
import { Observable } from 'rxjs';
import { ResponseWithProgress } from '../ipc-request';

@Injectable({
  providedIn: 'root'
})

export class TaskService {

  tasks: Task[] = [];

  constructor(private toastService: ToastService) {}

  runTask<T>(taskName:string, project: Project, runnable: Observable<ResponseWithProgress<T>>, onComplete: Observable<boolean>)
  {
    if(this.hasRunningTask(project))
    {
      return false;
    }
    let index = this.tasks.findIndex((item) => { return item.project == project.path})
    
    if(index != -1)
    {
      this.tasks.splice(index, 1);
    }
    
    let task = new Task({project: project.path, name: taskName});

    runnable.subscribe(
      (response) => {
        if(response.progress)
        {
          task.progress.next(response.progress);
        }
        if(response.data)
        {
            task.stream.next(response.data);
        }
      },
      (error) => {
        task.error = error;
        task.running = false;
        task.progress.error(task.error);
        this.toastService.danger("The task " + task.name + " could not be completed succesfully");
      },
      ()=> {
        task.complete();
        onComplete.subscribe(
          (result) => {
            if(result)
            {
              task.completed = true;
              this.toastService.success("The task " + task.name + " has completed succesfully");
            }
            else
            {
              task.progress.error("The project could not be updated");
              this.toastService.danger("The task " + task.name + " could not be completed succesfully");
            }
          })
      }
    );

    this.tasks.push(task);
  }

  getTask(project: Project): Task
  {
    //let path = project ? project.path : "test";
    return this.tasks.find(item => { return item.project == project.path});
  }

  hasRunningTask(project: Project): boolean
  {
    let task = this.getTask(project);
    return task? task.running : false;
  }

  running(): boolean
  {
    if(this.tasks.length == 0) return false;

    for(let task of this.tasks)
    {
      if(task.running)
      {
        return true;
      }
    }

    return false;
  }
}
