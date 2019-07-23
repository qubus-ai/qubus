import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExifViewComponent } from './exif-view.component';

describe('ExifViewComponent', () => {
  let component: ExifViewComponent;
  let fixture: ComponentFixture<ExifViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExifViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExifViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
