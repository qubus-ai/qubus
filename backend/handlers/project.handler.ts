import * as fs from 'fs';
import * as ph from 'path';
import { FeatureCollection, Feature, GeometryObject, Point } from 'geojson';
import { getExif} from '../utils/image.utils';
import { IpcChannel, IpcResponseProgress } from '../commons';
import { startThumbsProcess } from '../thumbs/thumbs.process';
import { createThumbGM } from '../utils/image.utils';

export function listImages (path: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readdir(path, async (err, files) => {
            if (err) reject(err);
            files = files.filter(file => {
                let filepath = ph.join(path, file);

                if (!fs.lstatSync(filepath).isDirectory()) {
                    return ph.extname(filepath).toLocaleUpperCase() == ".JPG";
                }
                return false;
            })

        let featureCollection: FeatureCollection = { type: "FeatureCollection", features: [] }
            for (let file of files) {
               let point: Point = { type: "Point", coordinates: [0, 0] };
               let dateString: string;

               if(featureCollection.features.length == 0)
                {
                    try {
                        let  filename = ph.join(path, file);
               
                        let exif = await getExif(filename);

                        dateString = exif.exif.DateTimeOriginal;
                        
                        let latitude = exif.gps.GPSLatitude[0] + exif.gps.GPSLatitude[1] / 60 + exif.gps.GPSLatitude[2] / 3600;
                        if(exif.gps.GPSLatitudeRef != "N")
                        {
                            latitude *= -1.0;
                        }
                        let longitude = exif.gps.GPSLongitude[0] + exif.gps.GPSLongitude[1] / 60 + exif.gps.GPSLongitude[2] / 3600;
                        if(exif.gps.GPSLongitudeRef != "E")
                        {
                            longitude *= -1.0;
                        }
                        point.coordinates = [longitude, latitude];
                    }
                    catch (error) {
                        reject(error);
                        return;
                    }
                
                }
                
                let feature: Feature<GeometryObject> = {
                    type: "Feature",
                    geometry: point,
                    properties: {
                        name: file,
                        path: path,
                        dateString: dateString
                    }
                }

                featureCollection.features.push(feature);
                
            }

            fs.writeFileSync(ph.join(path, "images.json"), JSON.stringify(featureCollection));
            resolve();

        });

    });
}

export function dynamicInitialization (event: Electron.Event, ipcChannel: IpcChannel, session: string, path: string, useGm: string) {
    
    if(useGm != "true")
    {
        startThumbsProcess(path);
    }

    return new Promise<string>(async(resolve, reject) => {

        let imageListString = fs.readFileSync(ph.join(path, "images.json"), 'utf8');

        let featureCollectionRear = <FeatureCollection>JSON.parse(imageListString);

        let index = 1;

        let featureCollection: FeatureCollection = { type: "FeatureCollection", features: [] }
            for (let feature of featureCollectionRear.features) {
                let  filename = ph.join(feature.properties.path, feature.properties.name);
               
                let point: Point = { type: "Point", coordinates: [0, 0] };
                let dateString: string
                try {
                    let exif = await getExif(filename);

                    dateString = exif.exif.DateTimeOriginal;
                    
                    let latitude = exif.gps.GPSLatitude[0] + exif.gps.GPSLatitude[1] / 60 + exif.gps.GPSLatitude[2] / 3600;
                    if(exif.gps.GPSLatitudeRef != "N")
                    {
                        latitude *= -1.0;
                    }
                    let longitude = exif.gps.GPSLongitude[0] + exif.gps.GPSLongitude[1] / 60 + exif.gps.GPSLongitude[2] / 3600;
                    if(exif.gps.GPSLongitudeRef != "E")
                    {
                        longitude *= -1.0;
                    }
                    point.coordinates = [longitude, latitude];
                }
                catch (error) {
                    reject(error);
                    return;
                }
                feature.geometry = point;
                feature.properties.dateString = dateString;

                if(useGm == "true")
                {
                    try{
                        await createThumbGM(filename);
                    }
                    catch(error)
                    {
                        
                    }
                }
        
                let reponse: IpcResponseProgress<string> = { progress: index * 100 / featureCollectionRear.features.length, 
                                                             session: session,
                                                             data: JSON.stringify(feature) };

                event.sender.send(ipcChannel.toString(), reponse);
                index++;
            }

            fs.writeFileSync(ph.join(path, "images.json"), JSON.stringify(featureCollectionRear));
            resolve();
    });
}