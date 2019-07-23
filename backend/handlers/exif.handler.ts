import { getExif} from '../utils/image.utils';

export function readExif(path: string) {
    return new Promise<string>(async(resolve, reject)=> {
       try{
           let data = await getExif(path);
           let stringified = JSON.stringify(data);
           return resolve(stringified);
       }
       catch(error)
       {
            reject(error);
       }  
    })
}