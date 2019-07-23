import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjecFormComponent } from './projec-form.component';

describe('ProjecFormComponent', () => {
  let component: ProjecFormComponent;
  let fixture: ComponentFixture<ProjecFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjecFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjecFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
