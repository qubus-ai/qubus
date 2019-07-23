
import { IpcChannel, IpcResponse, IpcResponseProgress } from '../commons';
import { ipcMain } from 'electron';

export interface IpcHandler {
    channel: IpcChannel;
    handler: (...input: any[]) => any
}

export interface IpcHandlerSync {
    channel: IpcChannel;
    handler: (...input: any[]) => any
}

export interface IpcHandlerProgress {
    channel: IpcChannel;
    handler: (event: Electron.Event, channel: IpcChannel, session: string, ...input: any[]) => any;
}

export interface IpcHandlerOptions {
    ipcHandler?: IpcHandler[];
    ipcHandlerSync?: IpcHandlerSync[];
    ipcHandlerProgress?: IpcHandlerProgress[];
}


export function IpcHandlers(ipcHandlerOptions: IpcHandlerOptions): any {
    if (ipcHandlerOptions.ipcHandler) {
        for (let ipc of ipcHandlerOptions.ipcHandler) {
            registerIpcHandler(ipc.channel, ipc.handler);
        }
    }
    if (ipcHandlerOptions.ipcHandlerSync) {
        for (let ipc of ipcHandlerOptions.ipcHandlerSync) {
            registerIpcHandlerSync(ipc.channel, ipc.handler);
        }
    }

    if (ipcHandlerOptions.ipcHandlerProgress) {
        for (let ipc of ipcHandlerOptions.ipcHandlerProgress) {
            registerIpcHandlerProgress(ipc.channel, ipc.handler);
        }
    }
    return null;
}

export function registerIpcHandler<I, O>(channel: IpcChannel, handler: (...input: I[]) => O)
{
    
    ipcMain.on(channel.toString(), async(event:Electron.Event, session:string, ...input: I[])=>{
        let result: O = null;
        let error: Error = null;
       
        try{
            result = await handler(...input);
        }
        catch(err)
        {
            error = err;
        }
       
        event.sender.send(channel.toString(), {session: session, data: result, error:  error ? error.message: null} as IpcResponse<O>);
      
    })
}

export function registerIpcHandlerProgress<I, O>(channel: IpcChannel, handler: (event: Electron.Event, channel: IpcChannel, session: string, ...input: I[]) => O)
{
    ipcMain.on(channel.toString(), async(event:Electron.Event, session:string, ...input: I[])=>{
        let result: O = null;
        let error: Error = null;
       
        try{
            result = await handler(event, channel, session,  ...input);
        }
        catch(err)
        {
            error = err;
        }
       
        event.sender.send(channel.toString(), {session: session, data: result, error:  error ? error.message: null, completed: true} as IpcResponseProgress<O>);
      
    })
}

export function registerIpcHandlerSync<I, O>(channel: IpcChannel, handler: (...input: I[]) => O)
{

    ipcMain.on(channel.toString(), (event:Electron.Event, session:string, ...input: I[])=>{
        let result: O = null;
        let error: Error = null;
     
        try{
            result = handler(...input);
        }
        catch(err)
        {
            error = err;
        }
        event.returnValue = {session: session, data: result, error: error ? error.message: null} as IpcResponse<O>;   
    })
}