import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Input } from '@angular/core';
import { Image } from '../model/image';
import { ActiveProjectService } from '../../active-project.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Project } from 'src/app/project/model/project';
import { ProjectService } from 'src/app/project/project.service';

export enum ImageVerticalPlacement {
  TOP = 0,
  CENTER,
  BOTTOM,
  _END
}

export enum ImageHorizontalPlacement {
  LEFT = 0,
  CENTER,
  RIGHT,
  _END
}

export enum ImageSize {
  BIG = 0,
  MEDIUM,
  SMALL,
  _END
}

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.css']
})
export class ImageViewComponent implements OnInit, OnDestroy {

  image: Image;

  project: Project;

  previewVisible: boolean = true;

  previewWidth: number = 220;

  ImageVerticalPlacement = ImageVerticalPlacement;
  ImageHorizontalPlacement = ImageHorizontalPlacement;

  @Input() imageSize: ImageSize = ImageSize.BIG;
  @Input() verticalPlacement: ImageVerticalPlacement = ImageVerticalPlacement.CENTER;
  @Input() horizontalPlacement: ImageHorizontalPlacement = ImageHorizontalPlacement.CENTER;

  @Input() imagePlacementEnabled: boolean = false;

  @ViewChild("view", { read: ElementRef }) viewRef: ElementRef;

  activeImageSubscription: Subscription;
  previewToggleTimeout: any;

  constructor(private activeProjectService: ActiveProjectService,
              private projectService: ProjectService, 
              private router: Router) { }

  ngOnInit() {
    this.activeImageSubscription = this.activeProjectService.getActiveImage().subscribe(async data => {
      if(!data || !data.image) return;
      this.project = await this.projectService.getByPath(data.image.path);
      this.image = data.image;
    });
  }

  ngOnDestroy(): void {
    this.activeImageSubscription && this.activeImageSubscription.unsubscribe();
  }

  getUrl(image: Image) {
    if (!image) return '';
    return 'url(' + image.getSrc() + ')';
  }

  togglePreview() {
    if (this.previewToggleTimeout) return;

    if (this.previewVisible) {
      this.previewWidth = 0;
      this.previewToggleTimeout = setTimeout(() => {
        this.previewVisible = false;
        this.previewToggleTimeout = null;
      }, 2005);
    }
    else {
      this.previewVisible = true;
      this.previewToggleTimeout = setTimeout(() => {
        this.previewWidth = 220;
        this.previewToggleTimeout = null;
      }, 1);

    }
  }

  getPreivewSize() {
    return this.previewWidth;
  }

  toggleImageSize() {
    this.imageSize++;
    if (this.imageSize == ImageSize._END) {
      this.imageSize = ImageSize.BIG;
    }
  }

  getImageSize() {
    if (this.imageSize == ImageSize.BIG) {
      return { 'max-height': '99vh', 'max-width': '99%' };
    }
    else if (this.imageSize == ImageSize.MEDIUM) {
      return { 'max-height': '50vh', 'max-width': '99%' };
    }
    else {
      return { 'max-height': '20vh', 'max-width': '99%' };
    }
  }

  toggleVertical(offset: number) {
    this.verticalPlacement += offset;
    if (this.verticalPlacement == ImageVerticalPlacement._END) {
      this.verticalPlacement = ImageVerticalPlacement.BOTTOM;
    }
    else if (this.verticalPlacement < 0) {
      this.verticalPlacement = ImageVerticalPlacement.TOP
    }
  }

  getAlignItems() {
    if (this.verticalPlacement == ImageVerticalPlacement.TOP) {
      return 'flex-start';
    }
    else if (this.verticalPlacement == ImageVerticalPlacement.CENTER) {
      return 'center';
    }
    else {
      return 'flex-end';
    }
  }

  toggleHorizontal(offset: number) {
    this.horizontalPlacement += offset;
    if (this.horizontalPlacement == ImageHorizontalPlacement._END) {
      this.horizontalPlacement = ImageHorizontalPlacement.RIGHT;
    }
    else if (this.horizontalPlacement < 0) {
      this.horizontalPlacement = ImageHorizontalPlacement.LEFT
    }
  }

  getJustifyContent() {

    if (this.horizontalPlacement == ImageHorizontalPlacement.LEFT) {
      return 'flex-start';
    }
    else if (this.horizontalPlacement == ImageHorizontalPlacement.CENTER) {
      return 'center';
    }
    else {
      return 'flex-end';
    }
  }

  detailView(image: Image) {
    this.activeProjectService.selectImage(image);
    this.router.navigateByUrl('imageDetailView');
  }
}
