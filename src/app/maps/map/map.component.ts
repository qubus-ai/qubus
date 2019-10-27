import { Component, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import { Tile } from 'ol/layer';
import * as OSM from 'ol/source/OSM';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/settings.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  map: Map;
  tileLayer = new Tile({ source: new OSM.default({ url: "" }) });

  settingsSubscription: Subscription;
  
  constructor(private settingsService: SettingsService) { }

  ngOnInit() {

    this.settingsSubscription = this.settingsService.settingsChanged().subscribe(setting => {
      this.setTileLayerSource();
    });

    this.map = new Map({
      target: 'map',
      layers: [this.tileLayer],
      view: new View({
        center: [60, 60],
        zoom: 6
      })
    })

    this.setTileLayerSource();
  }

  private setTileLayerSource(): void
  {
    let url = this.settingsService.settings.map || "http://stamen-tiles-c.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png";
    this.tileLayer.setSource(new OSM.default({ url: url }));
  }
}
