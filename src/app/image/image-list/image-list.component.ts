import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy, AfterViewInit } from '@angular/core';
import { ActiveProjectService } from '../../active-project.service';
import { Image } from '../model/image';
import { Router, ActivatedRoute } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ToastService } from '../../toast/toast.service';
import { ExifViewComponent } from '../exif-view/exif-view.component';
import { MatDialog, MatMenu, MatMenuContent } from '@angular/material';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ImageService } from '../image.service';
import { Project } from 'src/app/project/model/project';
import { ProjectService } from 'src/app/project/project.service';


@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css']
})
export class ImageListComponent implements OnInit, OnDestroy, AfterViewInit {
  
  images: Image[] =[];

  @ViewChild('userMenu') userMenu: MatMenu;

  @ViewChild(CdkVirtualScrollViewport) scroll: CdkVirtualScrollViewport;

  @ViewChild(MatMenuContent) lazyContent:MatMenuContent;

  overlayRef: OverlayRef | null;

  contexMenuSubscription: Subscription;
  activeImageSubscription: Subscription;

  project: Project;

  constructor(private activeProjectService: ActiveProjectService,
              private router: Router,
              private toastService: ToastService,
              public dialog: MatDialog,
              public overlay: Overlay,
              public viewContainerRef: ViewContainerRef,
              private imageService: ImageService,
              private projectService: ProjectService,
              private route: ActivatedRoute) {}

  async ngOnInit() {
    let index = Number(this.route.snapshot.paramMap.get('id'));
    this.project = await this.projectService.getByIndex(index);
    this.images = await this.imageService.getImages(this.project.path).toPromise();
  }

  ngAfterViewInit(): void {
    this.activeImageSubscription = this.activeProjectService.getActiveImage().subscribe(data => {
      if(!data.image) return;
      let index = this.images.findIndex(item => { return item.name == data.image.name});
      setTimeout(()=>{
        let imageHeight = 202;
        let centeroff = (this.scroll.getViewportSize() /  2) - (imageHeight /2);
        let offset = index * imageHeight - centeroff;
        this.scroll.scrollTo({top: offset, behavior: 'auto'});
      }, 1)
    })
  }
 
  ngOnDestroy(): void
  {
    this.activeImageSubscription && this.activeImageSubscription.unsubscribe();
  }

  selectImage(image: Image)
  {
    this.activeProjectService.selectImage(image);
  }

  mapView(image: Image)
  {
    this.activeProjectService.selectImage(image);
    this.router.navigateByUrl('imageMapView');
  }

  detailView(image: Image)
  {
    this.activeProjectService.selectImage(image);
    this.router.navigateByUrl('imageDetailView');
  }

  openContextMenu({x, y}: MouseEvent, image)
  {
    this.closeContextMenu();
    const positionStrategy = this.overlay.position().flexibleConnectedTo({x, y}).withPositions([{
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top'
    }]);

    this.overlayRef = this.overlay.create({positionStrategy, scrollStrategy: this.overlay.scrollStrategies.close()});

    this.overlayRef.attach(new TemplatePortal(this.userMenu.templateRef, this.viewContainerRef));

    this.lazyContent.attach({image: image});
    (this.userMenu)._startAnimation();

    this.contexMenuSubscription = fromEvent<MouseEvent>(document, 'click').pipe(filter(event => {
      const clickTarget = event.target as HTMLElement;
      return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
    }),take(1)).subscribe(() => this.closeContextMenu())
  }

  closeContextMenu()
  {
    this.contexMenuSubscription && this.contexMenuSubscription.unsubscribe();
    if(this.overlayRef)
    {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  zoomTo(image: Image)
  {
    this.activeProjectService.selectImage(image, ['zoom', true]);
  }

  getExif(image: Image)
  {
    this.closeContextMenu();

    this.imageService.getExif(image).subscribe(exif => {
      const dialogRef = this.dialog.open(ExifViewComponent, {
        width: '70%', data: {exif, image}
      });
    }, (error) =>
    {
      this.toastService.warning(error);
    })
  }
}
