import { Injectable } from '@angular/core';
import { Toast, ToastType } from './model/toast';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()
export class ToastService {

  toasts: Subject<Toast>;
  constructor() { 
    this.toasts = new Subject<Toast>();
  }

  getToast(): Observable<Toast>
  {
    return this.toasts.asObservable();
  }

  private insert(t: Toast)
  {
    this.toasts.next(t);
  }

  success(msg: string)
  {
    let t: Toast = new Toast(ToastType.SUCCESS, msg);
    this.insert(t);
  }

  info(msg: string)
  {
    let t: Toast = new Toast(ToastType.INFO, msg);
    this.insert(t);
  }

  warning(msg: string)
  {
    let t: Toast = new Toast(ToastType.WARNING, msg);
    this.insert(t);
  }

  danger(msg: string)
  {
    let t: Toast = new Toast(ToastType.DANGER, msg);
    this.insert(t);
  }
}
