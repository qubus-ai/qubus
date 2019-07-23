
export enum MasterMessageType
{
    CM_PROCESS = 1000,
    CM_TERMINATE
}

export class MasterMessage{
    type: MasterMessageType;
    path?: string;
}

export enum WorkerMessageType
{
    CM_PROCESS,
    CM_WAIT,
    CM_TERMINATE
}

export class WorkerMessage{
    type: WorkerMessageType;
    path?: string;
}