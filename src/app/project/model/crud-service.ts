import { ReplaySubject, Observable, of, Subject } from "rxjs";
import { tap } from 'rxjs/operators';

export enum UpdateType {
    SAVE = 1,
    DELETE,
    UPDATE
}

export class UpdateDate<T> {
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

    updateStream: Subject<UpdateDate<T>> = new Subject();

    get(): Observable<T[]>
    {
        return this.items? of(this.items) : this.onGet();
    }

    protected abstract onGet(): Observable<T[]>

    save(item: T): Observable<boolean>
    {
        return this.onSave(item).pipe(tap(result => {
            if(result)
            {
                this.updateStream.next(new UpdateDate(item, UpdateType.SAVE));
            }
        }));
    }

    protected abstract onSave(item: T): Observable<boolean>

    delete(item: T): Observable<boolean>
    {
        return this.onDelete(item).pipe(tap(result => {
            if(result)
            {
                this.updateStream.next(new UpdateDate(item, UpdateType.DELETE));
            }
        }));
    }

    protected abstract onDelete(item: T): Observable<boolean>

    update(item: T): Observable<boolean>
    {
        return this.onUpdate(item).pipe(tap(result => {
            if(result)
            {
                this.updateStream.next(new UpdateDate(item, UpdateType.UPDATE));
            }
        }));
    }

    protected abstract onUpdate(item: T): Observable<boolean>

}