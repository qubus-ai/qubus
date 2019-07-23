import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDetailViewComponent } from './image-detail-view.component';

describe('ImageDetailViewComponent', () => {
  let component: ImageDetailViewComponent;
  let fixture: ComponentFixture<ImageDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
