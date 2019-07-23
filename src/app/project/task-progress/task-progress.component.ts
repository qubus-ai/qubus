import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Task } from '../model/task';
import { ToastService } from '../../toast/toast.service';

@Component({
  selector: 'task-progress',
  templateUrl: './task-progress.component.html',
  styleUrls: ['./task-progress.component.css']
})
export class TaskProgressComponent implements OnInit, OnDestroy {

  private _task: Task;

  get task() {
    return this._task;
  }

  @Input() set task(task: Task) {
    if (task) {
      this._task = task;
      this.subscription = this._task.progress.subscribe(response => {
        this.progress = response;
        this.cd.detectChanges();
      }, () => {

      }, () => {

      })
    }
  }

  progress: number = 0;
  subscription: Subscription;

  constructor(private cd: ChangeDetectorRef, 
              private toastService: ToastService) { }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.subscription && this.subscription.unsubscribe();
  }

  running(): boolean {
    return this.task ? this.task.running : false;
  }
}
