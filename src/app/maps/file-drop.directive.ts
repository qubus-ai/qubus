import { Directive, Output, Input, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[fileDrop]'
})
export class FileDropDirective {

    @Output() onFileDropped = new EventEmitter<String>();

    @HostListener('dragover', ['$event']) public onDragOver(evt) {
      console.log("dragover");
      evt.preventDefault();
      evt.stopPropagation();
    
    }

    @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
      console.log("dragleave");
      evt.preventDefault();
      evt.stopPropagation();
    
    }

    @HostListener('drop', ['$event']) public onDrop(evt) {
        console.log("drop");
        evt.preventDefault();
        evt.stopPropagation();

        let files = evt.dataTransfer.files;
        if (files.length > 0) {
          console.log("files", files);
          this.onFileDropped.emit(files[0])
        }
      }
}