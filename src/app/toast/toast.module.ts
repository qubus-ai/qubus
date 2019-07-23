import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast/toast.component';
import { ToastService } from './toast.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ToastComponent],
  exports: [ToastComponent],
  providers: [ ToastService ]
})
export class ToastModule { }
