import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../material.module';
import { ImageGridComponent } from './image-grid/image-grid.component';
import { ImageListComponent } from './image-list/image-list.component';
import { ImageViewComponent } from './image-view/image-view.component';
import { ImageMapViewComponent } from './image-map-view/image-map-view.component';
import { ExifViewComponent } from './exif-view/exif-view.component';
import { ImageDetailViewComponent } from './image-detail-view/image-detail-view.component';
import { ImageLoaderDirective } from "./imageLoaderDirective";

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  declarations: [
    ImageGridComponent,
    ImageListComponent,
    ImageViewComponent,
    ImageMapViewComponent,
    ExifViewComponent,
    ImageDetailViewComponent,
    ImageLoaderDirective
        ],
  exports: [ImageLoaderDirective],
  entryComponents: [ExifViewComponent]
})
export class ImageModule { }
