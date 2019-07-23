import { IpcHandlers} from './ipc-utils';
import { IpcChannel } from '../commons';
import { readFileSync, readFile, writeFileSync, writeFile } from '../handlers/io.handler';
import { readExif } from '../handlers/exif.handler';
import { listImages, dynamicInitialization } from '../handlers/project.handler';


@IpcHandlers({
    ipcHandler: [
        { channel: IpcChannel.READ_FILE, handler: readFile },
        { channel: IpcChannel.WRITE_FILE, handler: writeFile },
        { channel: IpcChannel.READ_EXIF, handler: readExif },
        { channel: IpcChannel.DYNAMIC_LIST, handler: listImages },
    ],
    ipcHandlerSync: [
        { channel: IpcChannel.READ_FILE_SYNC, handler: readFileSync },
        { channel: IpcChannel.WRITE_FILE_SYNC, handler: writeFileSync },
    ],
    ipcHandlerProgress:[
        { channel: IpcChannel.DYNAMIC_INIT, handler: dynamicInitialization },
    ]
})
export class IpcRegistration {
}

