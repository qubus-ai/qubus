
export enum IpcChannel {
    READ_FILE_SYNC,
    READ_FILE,
    WRITE_FILE_SYNC,
    WRITE_FILE,
    INITIALIZE_PROJECT,
    READ_EXIF,
    RM_FILE,
    CLOSABLE,
    CLOSE_WINDOW,
    DYNAMIC_LIST,
    DYNAMIC_INIT
}


export interface IpcResponse<T>
{
    session?: string
    error?: string;
    data?: T;
}

export interface IpcResponseProgress<T> extends IpcResponse<T>
{
    completed?: boolean;
    progress?: number;
}