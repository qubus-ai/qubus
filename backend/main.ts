import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { WindowState } from './window-state';
import { IpcRegistration } from './ipc/ipc-handlers';
import { startThumbsProcessor, stopThumbsProcessor } from './thumbs/thumbs-processor';
import * as path from 'path';
import * as url from 'url';
import { IpcChannel } from './commons';

let ipcRegistration: IpcRegistration;

let mainWindow: Electron.BrowserWindow;
let windowstate: WindowState;
let closeWindow: boolean = false;

const args = process.argv.slice(1);
let dev = args.some(arg => arg === '--dev');
let remote = args.some(arg => arg === '--remote')

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: true,
    icon: path.join(__dirname, '../../assets/icons/png/64x64.png')
  });
 
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  if (!remote) {
		// and load the index.html of the app.
		mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, '../index.html'),
			protocol: 'file:',
			slashes: true
		}));
	} else {
		mainWindow.loadURL('http://127.0.0.1:4200');
	}

  // Open the DevTools.
  if(dev)
  {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("close", (e)=>{
    if(!closeWindow)
    {
      e.preventDefault();
      mainWindow.webContents.send(IpcChannel.CLOSABLE.toString());
    }
  })

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  windowstate = new WindowState(mainWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", ()=>{
  createWindow()
  startThumbsProcessor();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
  stopThumbsProcessor();
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcRegistration = new IpcRegistration();

ipcMain.on(IpcChannel.CLOSE_WINDOW.toString(), (result: boolean)=>{
  if(result)
  {
    closeWindow = true;
    mainWindow.close();  
  }
  else
  {
    let res = dialog.showMessageBox(mainWindow, {type: "warning", buttons: ['Cancel', 'Close'], title:'Qubus', message: 'Do you really want to close the application'});
    if(res)
    {
      closeWindow = true;
      mainWindow.close();  
    }
  }
})

