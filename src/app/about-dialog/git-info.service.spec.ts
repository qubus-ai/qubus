import { TestBed } from '@angular/core/testing';

import { GitInfoService } from './git-info.service';

describe('GitInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GitInfoService = TestBed.get(GitInfoService);
    expect(service).toBeTruthy();
  });
});
