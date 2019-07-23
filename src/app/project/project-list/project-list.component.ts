import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProjectService } from '../project.service';
import { Project } from '../model/project';
import { MatDialog } from '@angular/material';
import { ProjecFormComponent } from '../projec-form/projec-form.component';
import { ToastService } from '../../toast/toast.service';
import { ConfirmDialogComponent, ConfirmDialogInterface } from '../../confirm-dialog/confirm-dialog.component';
import { TaskService } from '../task.service';
import { ProjectFormState } from '../model/state';
import { Router } from '@angular/router';
import { ActiveProjectService } from '../../active-project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  projects: Project[];

  constructor(private projectService: ProjectService,
              public dialog: MatDialog,
              private toastService: ToastService,
              private cd: ChangeDetectorRef,
              private taskService: TaskService,
              private activeProjectService: ActiveProjectService,
              private router: Router) {
    projectService.getAll().subscribe(projects => {
      this.projects = projects
    });
  }

  ngOnInit() {
  }

  addProject(): void {
    const dialogRef = this.dialog.open(ProjecFormComponent, {
      width: '70%'
    });

    dialogRef.afterClosed().subscribe(project => {
      if (project) {
        this.projectService.insert(project).subscribe(response => {
          if (response) {
            this.toastService.success("Project created successfully!");
            this.projectService.initializeProject(project);
          }
          else {
            this.toastService.danger("Project creation failed!");
          }
        })
      }
    });
  }

  editProject(index: number) {
    let data = { project: this.projects[index], state: ProjectFormState.Edit }
    const dialogRef = this.dialog.open(ProjecFormComponent, {
      width: '70%', data: data
    });

    dialogRef.afterClosed().subscribe(data => {
      if (!data) return;
      if (data.update) {
        this.projectService.initializeProject(this.projects[index]);
      }
      if (data.projec) {
        this.projectService.update(data.project).subscribe(result => {
          if (result) {
            this.toastService.success("Project " + data.project.name + " successfully updated");
          }
          else {
            this.toastService.danger("Project " + data.project.name + " could not be updated");
          }
        })
      }
    })
  }

  openProjectGrid(index: number) {
    this.openProject(index, "/imageGrid");
  }

  openProjectMap(index: number) {
    this.openProject(index, "/imageMapView");
  }

  openProject(index: number, destination: string) {
    this.activeProjectService.open(this.projects[index]).subscribe(result => {
      this.router.navigateByUrl(destination);
    }, error => {
      this.toastService.danger("Project cannot be opened");
    })
  }

  deleteProject(index: number) {

    if (this.taskService.hasRunningTask(this.projects[index])) {
      return this.toastService.warning("The project " + this.projects[index].name + " has task in progress.");
    }
    let dialogData: ConfirmDialogInterface = { title: "Projects", text: " Do you realy want to remove project: " + this.projects[index].name + " ?" }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: dialogData, disableClose: true });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let name = this.projects[index].name;
        this.projectService.remove(index).subscribe(response => {
          response ? this.toastService.success("Project " + name + " removed.") : this.toastService.danger("Project " + name + "is not removed.");
        })
      }
    }
    )
  }

}
