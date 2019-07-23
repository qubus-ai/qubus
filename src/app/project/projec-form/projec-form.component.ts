import { Component, Inject,  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms'
import { ElectronService } from 'ngx-electron';
import { Project } from '../model/project';
import { ProjectFormState } from '../model/state'
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-projec-form',
  templateUrl: './projec-form.component.html',
  styleUrls: ['./projec-form.component.css']
})
export class ProjecFormComponent {

  ProjectFormState = ProjectFormState;

  submitLabel:string = "Create";
  formTitle:string = "Create new project";
  update: boolean = false;
  projectForm:FormGroup;

  private state: ProjectFormState;
  constructor(public dialogRef: MatDialogRef<ProjecFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {project: Project, state: ProjectFormState},
              private fb: FormBuilder, private electronService: ElectronService,
              private projectService: ProjectService) 
    { 
      if(data)
      {
        if(data.project)
        {
          this.state = data.state || ProjectFormState.Read;
          this.submitLabel = "Update";
          this.formTitle = "Settings of project: " + data.project.name;
          this.update  = true;

          this. projectForm = this.fb.group({
            name: ['', [Validators.required]],
            path: ['', [Validators.required]],
            comment: [''],
            imageSortType: ['1']
          })
          
          this.projectForm.patchValue(data.project);
          this.path.disable();

          if(this.state == ProjectFormState.Read)
          {
            this.name.disable();
            this.projectForm.get("comment").disable();
            this.formTitle = "View of project: " + data.project.name;
          }
        }
      }
      else
      {
        this.state = ProjectFormState.Create;

        this. projectForm = this.fb.group({
          name: ['', [Validators.required]],
          path: ['', [Validators.required, this.validateProjectPath.bind(this)]],
          comment: [''],
          imageSortType: ['1']
        })
      }  
  }

  get name()
  {
    return this.projectForm.get('name') as FormControl;
  }

  get path()
  {
    return this.projectForm.get('path') as FormControl;
  }

  validateProjectPath(control: AbstractControl): {[key: string]: any } 
  {
    return this.projectService.isProjectDuplicated(control.value) ? {duplicatePath: {valid: false, value: control.value}} : null;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit()
  {
    if(this.state == ProjectFormState.Create)
    { 
      this.dialogRef.close(new Project(this.projectForm.value));
    }
    else if(this.state == ProjectFormState.Edit)
    {
      this.data.project.update(this.projectForm.value);
      this.dialogRef.close({project: this.data.project, update: false});
    }
  }

  selectPath(): void {
    let folderPath = this.electronService.remote.dialog.showOpenDialog({ title: 'Select a folder', properties: ['openDirectory'] });
    if (folderPath === undefined) {
      return;
    }

    let path = folderPath[0];

    this.path.setValue(path);

    let sep = path.lastIndexOf('\\');

    if (sep == -1) {
      sep = path.lastIndexOf('/');
    }

    this.name.setValue(path.substr(sep + 1));
  }
 
  getPathState() {
    if(this.state == ProjectFormState.Create) return false;
    return true;
  }

  reinit()
  {
    this.dialogRef.close({update: true});
  }
}
