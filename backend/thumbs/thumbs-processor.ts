import { startThumbsProcess, stopThumbsProcess } from './thumbs.process';
import { app } from 'electron';
import * as fs from 'fs';
import * as ph from 'path';

export function stopThumbsProcessor()
{
    stopThumbsProcess();
}

export function startThumbsProcessor()
{
    let projectFile = ph.join(app.getPath('userData'), 'projects.json');

    if(!fs.existsSync(projectFile))
    {
        return;

    }
    let data = fs.readFileSync(projectFile);

    if(data)
    {
        let projects = JSON.parse(data.toString());

        for(let project of projects)
        {
            startThumbsProcess(project.path);
        }
    }
}