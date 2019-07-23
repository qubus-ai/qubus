import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../toast.service'
import { Toast, ToastType } from '../model/toast'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {

  toasts: Array<Toast>;
  subscription: Subscription;
  constructor(private toastService: ToastService,
              private cd: ChangeDetectorRef) {
    this.toasts = new Array<Toast>();
    this.subscription = this.toastService.getToast().subscribe(msg => {
      this.toasts.push(msg);
      this.cd.detectChanges();
      setTimeout(() => {
        let index = this.toasts.indexOf(msg);
        this.toasts.splice(index, 1);
        this.cd.detectChanges();
      }, 5000);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getClass(t: Toast) {
    if (!t) {
      return;
    }

    switch (t.type) {
      case ToastType.SUCCESS:
        return "toast success";
      case ToastType.INFO:
        return "toast info";
      case ToastType.WARNING:
        return "toast warning";
      case ToastType.DANGER:
        return "toast danger";
    }
  }

}
