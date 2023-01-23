import { TestBed } from '@angular/core/testing';

import { InternalCommunicationsService } from './internal-communications.service';

describe('InternalCommunicationsService', () => {
  let service: InternalCommunicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternalCommunicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
