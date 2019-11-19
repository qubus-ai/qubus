import { ReplaySubject, Observable } from "rxjs";

enum UpdateType {
    SAVE = 1,
    DELETE,
    UPDATE
}

class UpdateDate<T> {
    item: T;
    type: UpdateType;

    constructor(item: T, type: UpdateType)
    {
        this.item = item;
        this.type = type;
    }
}

export abstract class CrudService<T> {

    protected items: T[] = null;

    updateStream: ReplaySubject<UpdateDate<T>> = new ReplaySubject();

    abstract get(): Observable<T>

    save(item: T)
    {
        this.onSave(item).subscribe(result => {
            if(result)
            {
                this.updateStream.next(new UpdateDate(item, UpdateType.SAVE));
            }
        })
    }

    abstract onSave(item: T): Observable<boolean>

    delete(item: T)
    {
        this.onDelete(item).subscribe(result => {
            if(result)
            {
                this.updateStream.next(new UpdateDate(item, UpdateType.DELETE));
            }
        })
    }

    abstract onDelete(item: T): Observable<boolean>

    update(item: T)
    {
        this.onUpdate(item).subscribe(result => {
            if(result)
            {
                this.updateStream.next(new UpdateDate(item, UpdateType.UPDATE));
            }
        })
    }

    abstract onUpdate(item: T): Observable<boolean>


}