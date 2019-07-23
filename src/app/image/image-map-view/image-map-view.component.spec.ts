import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageMapViewComponent } from './image-map-view.component';

describe('ImageMapViewComponent', () => {
  let component: ImageMapViewComponent;
  let fixture: ComponentFixture<ImageMapViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageMapViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageMapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
