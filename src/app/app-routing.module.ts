import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectListComponent } from './project/project-list/project-list.component';
import { ImageGridComponent } from './image/image-grid/image-grid.component';
import { ImageListComponent } from './image/image-list/image-list.component';
import { ImageViewComponent } from './image/image-view/image-view.component';
import { ImageMapViewComponent } from './image/image-map-view/image-map-view.component';
import { ImageDetailViewComponent } from './image/image-detail-view/image-detail-view.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'projectList',
        pathMatch: 'full'
    },
    {
        path: 'projectList',
        component: ProjectListComponent
    },
    {
        path: "imageGrid",
        component: ImageGridComponent
    },
    {
        path: "imageView",
        component: ImageViewComponent
    },
    {
        path: "imageMapView",
        component: ImageMapViewComponent
    },
    {
        path: "imageDetailView",
        component: ImageDetailViewComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}