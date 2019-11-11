import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActiveProjectService } from '../../active-project.service';
import { Map, View, Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { transform } from 'ol/proj';
import { Select } from 'ol/interaction';
import { pointerMove } from 'ol/events/condition';
import { Vector, Tile } from 'ol/layer';
import * as VectorSource from 'ol/source/Vector';
import * as OSM from 'ol/source/OSM';
import { Style, Stroke, Circle } from 'ol/style';
import { Point } from 'ol/geom';
import { Image } from '../model/image';
import { ImageService } from '../image.service';
import { Subscription, Subject, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { ImageSize, ImageHorizontalPlacement, ImageVerticalPlacement } from '../image-view/image-view.component';
import { SettingsService } from 'src/app/settings.service';
import { TaskService } from 'src/app/project/task.service';
import { Point as PointGeojson, Feature as FeatureGeojson, FeatureCollection } from 'geojson';
import { ActivatedRoute } from '@angular/router';
import { Project } from 'src/app/project/model/project';
import { ProjectService } from 'src/app/project/project.service';

interface previewInterface {
  image: Image;
  pixel: number[];
}

@Component({
  selector: 'app-image-map-view',
  templateUrl: './image-map-view.component.html',
  styleUrls: ['./image-map-view.component.css']
})
export class ImageMapViewComponent implements OnInit, OnDestroy {

  map: Map;
  imageSource: VectorSource.default;
  activeImageFeature: Feature;

  image: Image;
  previewImage: Image;

  previewSubject: Subject<previewInterface>;

  previewSubscription: Subscription;
  activeImageSubscription: Subscription;
  settingsSubscription: Subscription;
  taskStreamSubscription: Subscription;

  ImageSize = ImageSize;
  ImageHorizontalPlacement = ImageHorizontalPlacement;
  ImageVerticalPlacement = ImageVerticalPlacement;

  previewAnchor: number[];
  isClicking: boolean = false;
  isInitialized: boolean = false;
  singleClickTimeout: any;

  tileLayer = new Tile({ source: new OSM.default({ url: "" }) });

  project: Project;

  constructor(private imageService: ImageService,
              private activeProjectService: ActiveProjectService,
              private settingsService: SettingsService,
              private taskService: TaskService,
              private route: ActivatedRoute,
              private projectService: ProjectService) {
    this.previewSubject = new Subject<previewInterface>();
    this.activeImageFeature = new Feature({ geometry: new Point([0, 0])});
  }

  async ngOnInit() {
    let index = Number(this.route.snapshot.paramMap.get('id'));
    this.project = await this.projectService.getByIndex(index);
    let task = this.taskService.getTaskByName(this.project.path);
    if (task) {
      this.taskStreamSubscription = task.stream.subscribe(data => {
        if (!data) return;
        if (!this.imageSource) return;
        let featureGeojson:FeatureGeojson = <FeatureGeojson>JSON.parse(data);
        let point  = featureGeojson.geometry as PointGeojson
        let feature = new Feature({ geometry: new Point(transform(point.coordinates, 'EPSG:4326', "EPSG:3857")) });
        feature.setProperties(featureGeojson.properties);
        this.imageSource.addFeature(feature);
      })
    }

    this.settingsSubscription = this.settingsService.settingsChanged().subscribe(setting => {
      this.setTileLayerSource();
    });

    this.activeImageSubscription = this.activeProjectService.getActiveImage().subscribe(data => {
      if (!data || !data.image) return;

      this.previewImage = null;
      this.image = data.image;
      this.activeImageFeature.setGeometry(new Point(transform([data.image.position[0], data.image.position[1]], 'EPSG:4326', "EPSG:3857")));

      if (this.isInitialized || data.zoom) {
        this.map.getView().animate({ center: transform([data.image.position[0], data.image.position[1]], 'EPSG:4326', "EPSG:3857"), zoom: 17 });
        this.isInitialized = false;
      }
    })

    this.previewSubscription = this.previewSubject.pipe(debounce(() => timer(1000))).subscribe(data => {
      if (this.isClicking) return;
      if (data) {
        this.previewImage = data.image;
        this.previewAnchor = data.pixel;
      }
      else {
        this.previewImage = null;
      }
    })

    this.isInitialized = true;

    this.setTileLayerSource();

    this.map = new Map({
      target: 'map',
      layers: [this.tileLayer],
      view: new View({
        center: [60, 60],
        zoom: 6
      })
    })

    this.setImageLayer();
    this.setActiveImageLayer();
    this.setMapInteraction();

   
  }

  ngOnDestroy(): void {
    this.activeImageSubscription && this.activeImageSubscription.unsubscribe();
    this.previewSubscription && this.previewSubscription.unsubscribe();
    this.settingsSubscription && this.settingsSubscription.unsubscribe();
    this.taskStreamSubscription && this.taskStreamSubscription.unsubscribe();
  }

  getPreviewStyle() {
    return { 'top': (this.previewAnchor[1] - 30) + 'px', 'left': (this.previewAnchor[0] + 10) + 'px' }
  }

  private setTileLayerSource(): void
  {
    let url = this.settingsService.settings.map || "http://stamen-tiles-c.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png";
    this.tileLayer.setSource(new OSM.default({ url: url }));
  }

  private async setImageLayer()
  {
    let features = await this.imageService.getFeatureCollection(this.project.path).toPromise();
    let filteredFeatures = features.features.filter((item) => {
      let point = item.geometry as PointGeojson;
      if (point.coordinates[0] != 0 && point.coordinates[1] != 0) {
        return true;
      }
      return false;
    });

    let featureCollection: FeatureCollection = { type: "FeatureCollection", features: filteredFeatures };

    this.imageSource = new VectorSource.default({
      features: (new GeoJSON()).readFeatures(featureCollection, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
    });

    let imageLayer = new Vector({
      source: this.imageSource
    });

    this.map.addLayer(imageLayer);
    this.map.getView().fit(this.imageSource.getExtent());
  }

  private setActiveImageLayer()
  {
    let activeImageSource = new VectorSource.default({});
    activeImageSource.addFeature(this.activeImageFeature);
    this.map.addLayer(new Vector({
      source: activeImageSource,
      style: new Style({
        image: new Circle({
          radius: 6, fill: null, stroke: new Stroke({ color: [255, 0, 0, 0.4], width: 4 })
        })
      })
    }));
  }

  private setMapInteraction(): void
  {
    let selection = new Select({ condition: pointerMove });
    
    selection.on('select', async(event) => {
      if (selection.getFeatures().getArray().length > 0) {
        let name = selection.getFeatures().getArray()[0].get('name')
        let proj = selection.getFeatures().getArray()[0].get('path')
        console.log("======", name, proj);
        let img =  await this.imageService.getImage(proj, name);
        let p = [(<any>event).mapBrowserEvent.originalEvent.clientX, (<any>event).mapBrowserEvent.originalEvent.clientY];
        this.previewSubject.next({ image: img, pixel: p });
      }
      else {
        this.previewSubject.next(null);
      }
    })

    this.map.addInteraction(selection);

    this.map.on('singleclick', event => {
      this.isClicking = true;
      if (this.singleClickTimeout) {
        clearTimeout(this.singleClickTimeout);
      }
      this.singleClickTimeout = setTimeout(() => {
        this.isClicking = false;
      }, 2000);

      let feature = this.map.forEachFeatureAtPixel((<any>event).pixel, (feature, layer) => {
        return feature;
      })
      if (feature) {
        this.activeProjectService.selectImageByName(feature.get('path'), feature.get('name'));
      }
    })

  }
}
