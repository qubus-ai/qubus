import { Feature, Point } from 'geojson';
import { Feature as OlFeature } from 'ol';
import { Point as OlPoint } from 'ol/geom';
import { transform } from 'ol/proj';

export interface IImage
{
    name?: string;
    path?: string;
    dateString: string
}

export class Image
{
    name: string;
    path: string;
    width: number;
    height: number;
    thumbnail: string;
    position: number[];
    dateString: string;
    date: Date;

    constructor(options: IImage)
    {
        this.name = options.name || '';
        this.path = options.path || '';
        if(options.dateString)
        {
            this.dateString = options.dateString;
      
            let dateBuffer = this.dateString.split(' ');
            let date = dateBuffer[0].split(':');
            let time = dateBuffer[1].split(':');
            this.date = new Date(Number.parseInt(date[0]), Number.parseInt(date[1]), Number.parseInt(date[2]), 
                                Number.parseInt(time[0]), Number.parseInt(time[1]), Number.parseInt(time[2]));
            
        }
    }

    getSrc()
    {
      return "file://" + this.path + '/' + this.name;
    }
    
    getSrcThumb()
    {
        //if(this.thumbnail) return "file://" + this.thumbnail;
        return "file://" + this.path + '/.thumbs/' + this.name;
    }
}

export function imageFromFeature(feature: Feature)
{
    let image = new Image(<IImage>feature.properties);
    let point = <Point>(feature.geometry);
    image.position = transform([point.coordinates[0], point.coordinates[1]], "EPSG:3857", 'EPSG:4326');
    return image;
}

export function imageFromOlFeature(feature: OlFeature)
{
    let image = new Image(<IImage>feature.getProperties());
    let point = <OlPoint>feature.getGeometry();
    let coordinates = point.getCoordinates();
    image.position = transform([coordinates[0], coordinates[1]], "EPSG:3857", 'EPSG:4326');
    return image;
}