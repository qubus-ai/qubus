export enum ImageSortType
{
    DATE = 0,
    NAME
}


export class Project{

    path: string;
    name: string;
    comment: string;
    initialized: boolean;
    imageSortType: ImageSortType;

    constructor(options: {path?: string, name?: string, comment?: string, initialized?: boolean, imageSortType?:ImageSortType}){
        this.path = options.path || '';
        this.name = options.name || '';
        this.comment = options.comment || '';
        this.initialized = options.initialized || false;
        this.imageSortType = options.imageSortType || ImageSortType.DATE;
    }

    update(options: {name?: string, comment?: string, initialized?: boolean, imageSortType?:ImageSortType}){
        if(options.name)
        {
            this.name = options.name;
        }

        if(options.comment)
        {
            this.comment = options.comment;
        }

        if(options.initialized)
        {
            this.initialized = options.initialized;
        }

        if(options.imageSortType)
        {
            this.imageSortType = options.imageSortType;
        }
    }
}