import {TestBed} from '@angular/core/testing';

import {ManagerPageWBService} from './manager-page-wb.service';
import {IPcs} from "../core/IPcs";

describe('ManagerPageWBService', () => {
  let service: ManagerPageWBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPageWBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it ('doGetMotifsPcsFromPcs Affine', () => {
    const pcs = new IPcs({strPcs:"0, 4, 7"})
    let distinct = true
    expect(service.doGetMotifsPcsFromPcs(pcs, 'Affine', distinct).length).toEqual(4)

    const pcsLimitedTransposition = new IPcs({strPcs:"0, 3, 6, 9"})
    expect(service.doGetMotifsPcsFromPcs(pcsLimitedTransposition, 'Affine', distinct).length).toEqual(1)
    expect(service.doGetMotifsPcsFromPcs(pcsLimitedTransposition, 'Affine', !distinct).length).toEqual(4)
  })

  it ('doGetPcsMotifsFromPcs Musaic', () => {
    const pcs = new IPcs({strPcs:"0, 4, 7"})
    let distinct = true

    expect(service.doGetMotifsPcsFromPcs(pcs, 'Musaic', distinct).length).toEqual(8)
    expect(service.doGetMotifsPcsFromPcs(pcs, 'Musaic', !distinct).length).toEqual(8)

    const pcsLimitedTransposition = new IPcs({strPcs:"0, 3, 6, 9"})

    // 2 motifs expected, this and this complement (1,2,4,5,7,8,10,11)
    expect(service.doGetMotifsPcsFromPcs(pcsLimitedTransposition, 'Musaic', distinct).length).toEqual(2)

    expect(service.doGetMotifsPcsFromPcs(pcsLimitedTransposition, 'Musaic', !distinct).length).toEqual(8)
  })

});
