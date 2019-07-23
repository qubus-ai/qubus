
export enum ToastType
{
    SUCCESS, INFO, WARNING, DANGER
}
export class Toast
{
    type: ToastType;
    message: string;
    constructor(t: ToastType, msg: string)
    {
        this.type = t;
        this.message = msg;
    }
}