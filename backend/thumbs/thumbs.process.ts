import * as child_process from 'child_process';
import {MasterMessageType, MasterMessage} from './thumbs.messages';

const args = process.argv.slice(1);
let dev = args.some(arg => arg === '--dev');

let master: child_process.ChildProcess = null;

export function startThumbsProcess(path: string)
{
    if(!master)
    {
        if(dev)
        {
            master = child_process.fork('./dist/backend/thumbs/thumbs-master.process.js');
        }
        else
        {
            master = child_process.fork( __dirname + '/thumbs-master.process.js');
        }
        master.on("exit", ()=>{
	        master = null;
        });
    }

    let message: MasterMessage = {type: MasterMessageType.CM_PROCESS, path: path};
    master.send(message);
}

export function stopThumbsProcess()
{
    if(master)
    {
        let message: MasterMessage = {type: MasterMessageType.CM_TERMINATE};
        master.send(message);
    }
}
