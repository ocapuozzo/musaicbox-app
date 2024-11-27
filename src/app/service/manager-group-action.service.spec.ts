import {TestBed} from '@angular/core/testing';

import {ManagerGroupActionService} from './manager-group-action.service';

describe('ManagerGroupActionService', () => {
  let service: ManagerGroupActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerGroupActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('ManagerGroupActionService initialized', () => {
    expect(ManagerGroupActionService.GROUP_ACTION_INSTANCES).toBeTruthy()
  })

  it('ManagerGroupActionService Affine', () => {
    const groupAction = service.getGroupActionFromGroupName("n=12 [M1 M5 M7 M11]")
    expect(groupAction).toBeTruthy()
    expect(groupAction!.orbits.length).toEqual(158)
  })

  it('ManagerGroupActionService Dihedral', () => {
    const groupAction = service.getGroupActionFromGroupName("n=12 [M1 M11]")
    expect(groupAction).toBeTruthy()
    expect(groupAction!.orbits.length).toEqual(224)
  })


});
