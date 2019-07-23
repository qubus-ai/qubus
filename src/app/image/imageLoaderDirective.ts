import {Directive, Input, HostBinding} from '@angular/core'
import { OnInit } from '@angular/core';
import { Image } from './model/image';

@Directive({
    selector: '[imageLoader]',
    host: {
      '(error)':'onError()',
      '[src]':'src'
     }
  })
  
 export class ImageLoaderDirective implements OnInit {
   
    private _image: Image;
    src: string;

    @Input('imageLoader') 
    set image(image:Image)
    {
      this._image = image;
      this.src = this._image.getSrcThumb();
    }

    ngOnInit(): void {
        
    }

    onError() {
      this.src = this._image.getSrc();
    }

  }