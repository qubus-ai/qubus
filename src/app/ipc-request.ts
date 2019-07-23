import { IpcChannel, IpcResponse, IpcResponseProgress } from "../../backend/commons";
import { ElectronService } from "ngx-electron";
import { Injectable } from '@angular/core'
import { Observable, Subject } from "rxjs";

export interface ResponseWithProgress<T>
{
    data?: T,
    progress?: number;
}

@Injectable()
export class IpcRequest {

    constructor(private electronService: ElectronService) {
    }

    sendIpcRequest<I, O>(ipcChannel: IpcChannel, ...input: I[]): Promise<O> {
        return new Promise<O>((resolve, reject) => {

            let session: string = Math.random().toString(36).slice(2);
            let handler = (event: Event, response: IpcResponse<O>) => {
                if (session !== response.session) return;

                if (response.error) {
                    reject(response.error)
                }
                this.electronService.ipcRenderer.removeListener(ipcChannel.toString(), handler);

                resolve(response.data)
            }

            this.electronService.ipcRenderer.on(ipcChannel.toString(), handler)

            this.electronService.ipcRenderer.send(ipcChannel.toString(), session, ...input);
        });
    }

    sendIpcRequestProgress<I, O >(ipcChannel: IpcChannel, ...input: I[]): Observable<ResponseWithProgress<O>>
    {
        let subject =  new Subject<ResponseWithProgress<O>>();

        let session: string = Math.random().toString(36).slice(2);

        let handler = (event: Event, response: IpcResponseProgress<O>) => {

            if(session !== response.session) return;

            if(response.error)
            {
                subject.error(response.error);
                this.electronService.ipcRenderer.removeListener(ipcChannel.toString(), handler);
            }

            if(response.progress)
            {
                subject.next({data: response.data, progress: response.progress});
            }

            if(response.completed)
            {
                subject.next({data: response.data, progress: response.progress});
                subject.complete();
                this.electronService.ipcRenderer.removeListener(ipcChannel.toString(), handler);
            }

           
        }
        
        this.electronService.ipcRenderer.on(ipcChannel.toString(), handler)

        this.electronService.ipcRenderer.send(ipcChannel.toString(), session, ...input);

        return subject.asObservable();
    }

    sendIpcRequestSync<I, O>(ipcChannel: IpcChannel, ...input: I[]): IpcResponse<O> {
        let session: string = Math.random().toString(36).slice(2);
        return this.electronService.ipcRenderer.sendSync(ipcChannel.toString(), session, ...input) as IpcResponse<O>;
    }
}



