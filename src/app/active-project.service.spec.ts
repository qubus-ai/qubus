import { TestBed } from '@angular/core/testing';

import { ActiveProjectService } from './active-project.service';

describe('ActiveProjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActiveProjectService = TestBed.get(ActiveProjectService);
    expect(service).toBeTruthy();
  });
});
