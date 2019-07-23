import { WorkerMessage, WorkerMessageType } from './thumbs.messages';
import { createThumbJimp } from '../utils/image.utils';

function sleep(ms: number)
{
    return new Promise((resolve) => {
        setTimeout(()=>{
            resolve();
        }, ms)
    })
}

process.on("message", async (message: WorkerMessage) => {
    if(message.type == WorkerMessageType.CM_WAIT)
    {
        await sleep(1000);
        process.send("done");
    }
    else if(message.type == WorkerMessageType.CM_PROCESS)
    {
        createThumbJimp(message.path).then(()=>{
            process.send("done");
        })
    }
    else if(message.type == WorkerMessageType.CM_TERMINATE)
    {
        process.exit();
    }
})

