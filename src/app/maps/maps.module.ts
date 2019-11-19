import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { FileDropDirective } from './file-drop.directive';
import { ImageModule } from '../image/image.module';

@NgModule({
  declarations: [
    MapComponent,
    FileDropDirective
  ],
  imports: [
    CommonModule,
    ImageModule
  ],
  exports: [MapComponent]
})
export class MapsModule { }
