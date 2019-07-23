import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { IpcRequest } from '../ipc-request';
import { IpcChannel } from 'backend/commons';

@Injectable({
  providedIn: 'root'
})
export class GitInfoService {

  private commit: string;

  constructor(private electronService: ElectronService, private ipcRequest: IpcRequest) {

    let response = this.ipcRequest.sendIpcRequestSync<string, string>(IpcChannel.READ_FILE_SYNC, "./dist/git.info");

    if(!response.error)
    {
      this.commit = response.data;
    }
  }

  getCommit(): string
  {
    return this.commit;
  }
}
