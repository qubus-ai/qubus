import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveProjectService } from '../../active-project.service';
import { Image as QImage }  from '../model/image';
import { Map, View, Feature } from 'ol';
import  * as Projection from 'ol/proj/Projection';
import { Image as MapImage, Vector } from 'ol/layer';
import { ImageStatic } from 'ol/source';
import * as VectorSource from 'ol/source/Vector';
import { Style, Stroke } from 'ol/style';
import { LineString } from 'ol/geom';
import { getCenter } from 'ol/extent';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Project } from 'src/app/project/model/project';
import { ProjectService } from 'src/app/project/project.service';


@Component({
  selector: 'app-image-detail-view',
  templateUrl: './image-detail-view.component.html',
  styleUrls: ['./image-detail-view.component.css']
})
export class ImageDetailViewComponent implements OnInit, OnDestroy {
 
  image: QImage;

  imageView: Map = null;
  imageLayer: MapImage = null;
  animating: boolean = false;

  activeImageSubscription: Subscription;

  project: Project;

  constructor(private activeProjectService: ActiveProjectService,
              private projectService: ProjectService,
              private route: ActivatedRoute) {}

  async ngOnInit() {
    let index = Number(this.route.snapshot.paramMap.get('id'));
    this.project = await this.projectService.getByIndex(index);
    this.activeImageSubscription = this.activeProjectService.getActiveImage().subscribe(data => {
      this.image = data.image;
      let img = new Image();
      img.onload = () => {
        this.image.width = img.width;
        this.image.height = img.height;
        let extent: [number, number, number, number] = [0, 0, img.width, img.height];
        
        let projection = new Projection.default({code: 'image', units: 'pixels', extent: extent })
    
        if(!this.imageLayer)
        {
          let url = "file://" + this.image.path + '/' + this.image.name;
          this.imageLayer = new MapImage({source: new ImageStatic({url: img.src, attributions: 'abb', 
          projection: projection, imageExtent: extent})});
        }
        else
        {
          this.imageView.removeLayer(this.imageLayer);
          let url = "file://" + this.image.path + '/' + this.image.name;
          this.imageLayer = new MapImage({source: new ImageStatic({url: img.src, attributions: 'abb', 
          projection: projection, imageExtent: extent})});
          
          this.imageView.addLayer(this.imageLayer);
        }
  
        if(!this.imageView)
        {
          this.imageView = new Map({
            layers: [this.imageLayer],
            target: 'imageView',
            view: new View({projection: projection, center: getCenter(extent), zoom: 2, maxZoom: 8})
          })
  
          let style = new Style({stroke: new Stroke({color: [0, 0, 127, 0.25], width: 8}), zIndex: 1})
          let vectorSource = new VectorSource.default({});
          let feature = new Feature();
          
          feature.setGeometry(new LineString([ [50, 0], [this.image.width, 0],[this.image.width, this.image.height - 50]]));
          vectorSource.addFeature(feature);
          let vector = new Vector({source: vectorSource,style: style,zIndex : -1});
        
          this.imageView.addLayer(vector); 
        }
      }

      img.src = this.image.getSrc();
    })
  }

  ngOnDestroy(): void {
    this.activeImageSubscription && this.activeImageSubscription.unsubscribe();
  }

  next()
  {
    this.activeProjectService.selectNext(this.project.path);
  }

  previous()
  {
    this.activeProjectService.selectPrevious(this.project.path);
  }

  rotate()
  {
    if(!this.animating)
    {
      let rot = this.imageView.getView().getRotation();
      rot += Math.PI /2;
      this.imageView.getView().animate({rotation: rot}, this.animationCallback.bind(this));
      this.animating = true;
    }
  }

  animationCallback()
  {
    this.animating = false;
  }

  reset()
  {
    if(!this.animating)
    {
      this.animating = true;
      this.imageView.getView().animate({center: getCenter([0, 0, this.image.width, this.image.height]), zoom: 2, rotation: 0}, this.animationCallback.bind(this));
    }
  }
}

