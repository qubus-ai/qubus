import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

export class Task
{
  project: string;
  name: string;
  stream: ReplaySubject<any>;
  progress: BehaviorSubject<number>;
  completed: boolean;
  error: string;
  running: boolean

  constructor(options: {project:string, name: string})
  {
    this.project = options.project;
    this.name = options.name;
    this.stream = new ReplaySubject<any>(Number.POSITIVE_INFINITY);
    this.progress = new BehaviorSubject<number>(0);
    this.completed = false;
    this.error = null;
    this.running = true;
  }

  complete(): void
  {
    this.completed = true;
    this.running = false;
    this.progress.complete();
    this.stream.complete();
  }
}