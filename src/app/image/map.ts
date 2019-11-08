import { Map, View, Feature } from 'ol';
import { Vector, Tile } from 'ol/layer';
import * as OSM from 'ol/source/OSM';
import { Point as PointGeojson, Feature as FeatureGeojson, FeatureCollection } from 'geojson';
import * as VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { map } from 'rxjs/operators';
import BaseLayer from 'ol/layer/Base';
import { Point } from 'ol/geom';
import { transform } from 'ol/proj';

export class Mapy
{
    map: Map;
    view: View = new View({ center: [0, 0], zoom: 1 });
    tileLayer = new Tile({ source: new OSM.default({ url: "http://stamen-tiles-c.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png" }) });
   

    constructor()
    {
       
    }

    initialize(id: string)
    {
        this.map = new Map({
            target: id,
            layers: [this.tileLayer],
            view: this.view
          })
    }

    addFeature(layerName: string, featureGeojson: FeatureGeojson)
    {
        let layer = this.createVectorLayer(name);
        let point  = featureGeojson.geometry as PointGeojson
        let feature = new Feature({ geometry: new Point(transform(point.coordinates, 'EPSG:4326', "EPSG:3857")) });
        feature.setProperties(featureGeojson.properties);
        layer.getSource().addFeature(feature)
    }

    addFeatureCollection(layerName: string, featureCollection: FeatureCollection)
    {
        let layer = this.createVectorLayer(layerName);

        let features = (new GeoJSON()).readFeatures(featureCollection, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        layer.getSource().addFeatures(features)
    }

    private createVectorLayer(name: string): Vector
    {
        let layer = <Vector>this.getLayer(name);
        if(!layer)
        {   
            layer = new Vector();
            layer.set('name', name);
            this.map.addLayer(layer);
        }
        return layer;

    }


    private getLayer(name: string): BaseLayer
    {
        let found;
        this.map.getLayers().forEach((layer, i) => {
            if(layer.get('name') === name)
            {
                found = layer;
            }
        })

        return found;
    }

    removeLayer(name: string)
    {
        let found = this.getLayer(name);
        this.map.removeLayer(found);
    }

    addImageLayer(featureCollection: FeatureCollection)
    {
      /*  this.imageSource = new VectorSource.default({
            features: (new GeoJSON()).readFeatures(featureCollection, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
          });
      
          let imageLayer = new Vector({
            source: this.imageSource
          });
      
          this.map.addLayer(imageLayer);*/
    }
}