import { ExifImage, ExifData } from 'exif';
import * as ph from 'path';
import * as gm from 'gm';
import * as fs from 'fs';
import * as jimp from 'jimp';

export function getExif(path: string) {
    return new Promise<ExifData>((resolve, reject) => {
        try {
            new ExifImage({ image: path }, (error, data) => {
                if (error) {
                    return reject(error);
                }
                else 
                {
                    resolve(data)
                }
            })
        }
        catch (error) {
            reject(error);
        }
    })
}

export function autoOrient(path: string) {
    return new Promise((resolve, reject) => {
        gm(path).autoOrient().write(path, (error) =>{
            error ? reject(error) : resolve(path);
        })
    })
}

export function getImageSize(path: string) {
    return new Promise<gm.Dimensions>((resolve, reject) => {
        gm(path).size((error, size) => {
            error ? reject(error) : resolve(size);
        })
    })
}


export function createThumbGM(path: string) {
    return new Promise((resolve, reject) => {
        let thumbnailFile = getThumbName(path);
        if(fs.existsSync(thumbnailFile)){
            return resolve(thumbnailFile);
        }
        gm(path).resize(240, 240).write(thumbnailFile, (error) =>{
            error ? reject(error): resolve(thumbnailFile);
        })
    })
}

export function createThumbJimp(path: string)
{
    let thumbnailFile = getThumbName(path);

    return new Promise((resolve, reject) =>{
        jimp.read(path).then(image => {
            let width = image.getWidth();
            let height = image.getHeight();
            let h = 0;
            let w = 0;
            if(width > height)
            {
                w = 256;
                h = height/width * 256;
                image.scaleToFit(256,jimp.AUTO).write(thumbnailFile);
            }
            else
            {
                h = 256;
                w = width/height * 256;
                image.scaleToFit(jimp.AUTO,256).write(thumbnailFile);
            }
            resolve();
        })
    })
}

function getThumbName(path: string)
{
    let basename = ph.basename(path);
    let thumbnailDir = ph.join(ph.dirname(path), ".thumbs");
    if(!fs.existsSync(thumbnailDir))
    {
        fs.mkdirSync(thumbnailDir)
    }

    return ph.join(thumbnailDir, basename);
}