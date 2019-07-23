import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';
import { ExifData } from 'exif';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Observable, of } from 'rxjs';
import { Image } from '../model/image';

export interface ExifViewData
{
  exif: ExifData;
  image: Image
}

class ExifNode{
  children: ExifNode[];
  name: string;
  value: any;
}

class ExifFlatNode{
  constructor(public expandable: boolean, public name: string, public level: number, public value: any){}
}

@Component({
  selector: 'app-exif-view',
  templateUrl: './exif-view.component.html',
  styleUrls: ['./exif-view.component.css']
})
export class ExifViewComponent implements OnInit {
  
  treeControl: FlatTreeControl<ExifFlatNode>;
  treeFlattener: MatTreeFlattener<ExifNode, ExifFlatNode>;
  dataSource: MatTreeFlatDataSource<ExifNode, ExifFlatNode>;

  content: string[] = [];
  title: string = "Exifdata of image: ";
  
  constructor(public dialogRef: MatDialogRef<ExifViewComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ExifViewData) {

      this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel, this._isExpandable, this._getChildren);
      this.treeControl = new FlatTreeControl<ExifFlatNode>(this._getLevel, this._isExpandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      if(data)
      {
        this.dataSource.data = this.buildTree(data.exif, 0);
        this.title += data.image.name;
      }
     }


  transformer(node: ExifNode, level: number)
  {
    return new ExifFlatNode(!!node.children, node.name, level, node.value)
  }

  _getLevel(node: ExifFlatNode)
  {
    return node.level;
  }

  _isExpandable(node: ExifFlatNode)
  {
    return node.expandable;
  }
  _getChildren(node: ExifNode): Observable<ExifNode[]>
  {
    return of(node.children);
  }

  hasChild(_: number, node: ExifFlatNode)
  {
    return node.expandable;
  }
  ngOnInit() {
  
  }

  buildTree(obj:{[key:string ]: any}, level:number): ExifNode[]
  {
    return Object.keys(obj).reduce<ExifNode[]>((accumulator, key) => {
      if(!accumulator) return null;
      const value = obj[key];
      const node = new ExifNode();
      node.name = key;
      if(value != null)
      {
        if(typeof value === 'object')
        {
          if(Array.isArray(value))
          {
              node.value = value;
          }
          else
          {
            node.children = this.buildTree(value, level + 1);
          }
        }
        else
        {
          node.value = value;
        }
        return accumulator.concat(node)
      }
    }, [])
  }
 }
