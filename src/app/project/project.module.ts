import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../material.module';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjecFormComponent } from './projec-form/projec-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskProgressComponent } from './task-progress/task-progress.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [ProjectListComponent, ProjecFormComponent, TaskProgressComponent],
  exports: [ProjectListComponent, ProjecFormComponent],
  entryComponents: [
    ProjecFormComponent
  ]
})
export class ProjectModule { }
