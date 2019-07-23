import * as ph from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as child_process from 'child_process';
import {MasterMessageType, MasterMessage, WorkerMessage, WorkerMessageType } from './thumbs.messages';

const args = process.argv.slice(1);
let dev = args.some(arg => arg === '--dev');

let queue: string[] = [];
let imageIndex: number = 0;

let workers: child_process.ChildProcess[] = [];

let filesadded: boolean = false;

process.on("message", (message: MasterMessage) => {

    if(message.type == MasterMessageType.CM_PROCESS)
    {
        addFilesToQueue(message.path).then(()=>{
            filesadded = true;
        });
    }
    else if(message.type == MasterMessageType.CM_TERMINATE)
    {
        for(let worker of workers)
        {
            let message: WorkerMessage = {type: WorkerMessageType.CM_TERMINATE};
            worker.send(message);
        }
    }
})

function addFilesToQueue(path: string)
{
    return new Promise((resolve, reject) => {
        fs.readdir(path, async (err, files) => {
             if (err) reject(err);
     
             files = files.map(file => {
                 return  ph.join(path, file);
             })
     
             files = files.filter(file => {
     
                 if (!fs.lstatSync(file).isDirectory()) {
                     return ph.extname(file).toLocaleUpperCase() == ".JPG";
                 }
                 return false;
             })
     
             files = files.filter(file => {
                 let basename = ph.basename(file);
     
                 let thumbnailDir = ph.join(ph.dirname(file), ".thumbs");
                 if(!fs.existsSync(thumbnailDir))
                 {
                     fs.mkdirSync(thumbnailDir)
                 }
     
                 let thumbnailFile = ph.join(thumbnailDir, basename);
     
                 return !fs.existsSync(thumbnailFile);
                 
             })
            
             for(let file of files)
             {
                 queue.push(file);
             
             }
             resolve();
            
         })
    })
}

for(let i = 0; i < os.cpus().length; i++)
{
    let worker: child_process.ChildProcess;
    if(dev)
    {
        worker = child_process.fork('./dist/backend/thumbs/thumbs-worker.process.js');
    }
    else
    {
        worker = child_process.fork( __dirname + '/thumbs-worker.process.js');
    }
    
    worker.on("message", ()=>{
        if(queue.length == 0 && !filesadded )
        {
            let message: WorkerMessage = {type: WorkerMessageType.CM_WAIT};
            worker.send(message);
        }
        else if(imageIndex < queue.length)
        {
            let message: WorkerMessage = {type: WorkerMessageType.CM_PROCESS, path: queue[imageIndex]};
            worker.send(message);
            imageIndex++;
        }
        else
        {
            let message: WorkerMessage = {type: WorkerMessageType.CM_TERMINATE};
            worker.send(message);
        }
    });

    worker.on("exit", () =>{
        workers = workers.filter((w)=>{
            return w.pid != worker.pid;
        });

        if(workers.length == 0)
        {
            
            process.exit();
        }
    });

    let message: WorkerMessage = {type: WorkerMessageType.CM_WAIT};
    worker.send(message);

    workers.push(worker);
    
}


