import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Image } from '../model/image';
import { Router, ActivatedRoute } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';
import { ToastService } from '../../toast/toast.service';
import { ExifViewComponent } from '../exif-view/exif-view.component';
import { MatDialog, MatMenu, MatMenuContent } from '@angular/material';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ActiveProjectService } from 'src/app/active-project.service';
import { ImageService } from '../image.service';
import { ProjectService } from 'src/app/project/project.service';
import { Project } from 'src/app/project/model/project';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.css']
})
export class ImageGridComponent implements OnInit, OnDestroy {

  images: Image[] = [];

  rows: Array<Array<Image>>;

  @ViewChild('scroll', { read: ElementRef }) scroll: ElementRef;

  @ViewChild('userMenu') userMenu: MatMenu;

  @ViewChild(MatMenuContent) lazyContent: MatMenuContent;

  overlayRef: OverlayRef | null;

  contexMenuSubscription: Subscription;

  resizeSubscription: Subscription;

  imageSubscription: Subscription;

  project: Project;

  constructor(private activeProjectService: ActiveProjectService,
              private imageService: ImageService,
              private router: Router,
              private toastService: ToastService,
              public dialog: MatDialog,
              public overlay: Overlay,
              public viewContainerRef: ViewContainerRef,
              private projectService: ProjectService) {}
  
  ngOnInit() {
    this.imageSubscription = this.activeProjectService.getActiveImage().subscribe(async data => {
      if(data)
      {
        this.project = await this.projectService.getByPath(data.image.path);
        this.images = await this.imageService.getImages(this.project.path).toPromise();
      }
      else
      {
        let projects = await this.projectService.get().toPromise();
        for(let p of projects)
        {
           this.images = this.images.concat(await this.imageService.getImages(p.path).toPromise());
        }
      }
      this.arrangeImages();
    })
    this.resizeSubscription = fromEvent(window, 'resize').pipe(debounceTime(500)).subscribe((event) => {
      this.arrangeImages();
    })
  }

  ngOnDestroy(): void {
    this.resizeSubscription && this.resizeSubscription.unsubscribe();
    this.imageSubscription && this.imageSubscription.unsubscribe();
  }

  arrangeImages() {
    let containerWidth = this.scroll.nativeElement.offsetWidth;
    let imageWidth = 202;
    let imageCount = Math.floor(containerWidth / imageWidth);
    let rowCount = Math.floor(this.images.length / imageCount);

    this.rows = new Array<Array<Image>>();

    for (let i = 0; i < rowCount; i++) {
      let imageRow = this.images.slice(i * imageCount, (i + 1) * imageCount);
      this.rows.push(imageRow);

    }
    if (this.images.length > rowCount * imageCount) {
      let imageRow = this.images.slice(rowCount * imageCount, this.images.length);
      this.rows.push(imageRow);
    }
  }

  openImage(image: Image) {
    this.activeProjectService.selectImage(image);
    this.router.navigateByUrl('imageView');
  }

  mapView(image: Image) {
    this.activeProjectService.selectImage(image);
    this.router.navigateByUrl('map');
  }

  getExif(image: Image) {
    this.closeContextMenu();

    this.imageService.getExif(image).subscribe(exif => {
      const dialogRef = this.dialog.open(ExifViewComponent, {
        width: '70%', data: { exif, image }
      });
    }, (error) => {
        this.toastService.warning(error);
      })
  }

  detailView(image: Image) {
    this.activeProjectService.selectImage(image);
    this.router.navigateByUrl('imageDetailView');
  }

  openContextMenu({ x, y }: MouseEvent, image) {
    this.closeContextMenu();
    const positionStrategy = this.overlay.position().flexibleConnectedTo({ x, y }).withPositions([{
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top'
    }]);

    this.overlayRef = this.overlay.create({ positionStrategy, scrollStrategy: this.overlay.scrollStrategies.close() });

    this.overlayRef.attach(new TemplatePortal(this.userMenu.templateRef, this.viewContainerRef));

    this.lazyContent.attach({ image: image });
    (this.userMenu)._startAnimation();

    this.contexMenuSubscription = fromEvent<MouseEvent>(document, 'click').pipe(filter(event => {
      const clickTarget = event.target as HTMLElement;
      return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
    }), take(1)).subscribe(() => this.closeContextMenu())
  }

  closeContextMenu() {
    this.contexMenuSubscription && this.contexMenuSubscription.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
