import { app, BrowserWindow } from 'electron';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as fs from 'fs';
import * as path from 'path';

class WindowProperties {

    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
    isFullscreen: boolean;

    constructor(){}
}

export class WindowState {

    private resizeSubject: Subject<WindowProperties> = new Subject<WindowProperties>();

    private windowProperties: WindowProperties = new WindowProperties();

    private fileName: string = "window-state.json";

    constructor(window: BrowserWindow, filename?: string)
    {
        if(filename)
        {
            this.fileName = filename;
        }

        let filePath = path.join(app.getPath('userData'), this.fileName);
        if(fs.existsSync(filePath))
        {
            let state:string  = fs.readFileSync(filePath).toString();
            this.windowProperties = <WindowProperties>JSON.parse(state);
            if(this.windowProperties.isMaximized)
            {
                window.maximize();
            }
            else if(this.windowProperties.isFullscreen)
            {
                window.setFullScreen(true);
            }
            else
            {
                if(this.windowProperties.x && this.windowProperties.y)
                {
                    window.setPosition(this.windowProperties.x, this.windowProperties.y);
                }
                if(this.windowProperties.width && this.windowProperties.height)
                {
                    window.setSize(this.windowProperties.width, this.windowProperties.height);
                }
            }
        }

        window.on("resize", () => {
            let size: number[] = window.getSize();
            this.windowProperties.width = size[0];
            this.windowProperties.height = size[1];
            this.update();
        });

        window.on("move", () => {
            let position: number[] = window.getPosition();
            this.windowProperties.x = position[0];
            this.windowProperties.y = position[1];
            this.update();
        });

        window.on("maximize", () => {
            this.windowProperties.isMaximized = true;
            this.update();
        })

        window.on("unmaximize", () => {
            this.windowProperties.isMaximized = false;
            this.update();
        })

        window.on("enter-full-screen", () => {
            this.windowProperties.isFullscreen = true;
            this.update();
        })

        window.on("leave-full-screen", () => {
            this.windowProperties.isFullscreen = false;
            this.update();
        })


        window.on("closed", () => {
            this.write(this.windowProperties);
        })

        this.resizeSubject.asObservable().pipe(debounceTime(1000)).subscribe(windowProperties => {
            this.write(windowProperties);
        })
    }

    update(): void
    {
        this.resizeSubject.next(this.windowProperties);
    }

    write(windowProperties: WindowProperties): void
    {  
        let filePath = path.join(app.getPath('userData'), this.fileName);
        fs.writeFileSync(filePath, JSON.stringify(windowProperties));
    }
}

