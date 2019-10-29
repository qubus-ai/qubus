import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { FileDropDirective } from './file-drop.directive'

@NgModule({
  declarations: [
    MapComponent,
    FileDropDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [MapComponent]
})
export class MapsModule { }
