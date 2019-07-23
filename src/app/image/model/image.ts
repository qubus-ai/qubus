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

    constructor(options: {name?: string, path?: string, thumbnail?: string, size?: {width: number, height: number}, dateString: string})
    {
        this.name = options.name || '';
        this.path = options.path || '';
        this.thumbnail = options.thumbnail || '';
        if(options.size)
        {
            this.width = options.size.width;
            this.height = options.size.height;
        }
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