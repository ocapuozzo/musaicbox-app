import { TestBed } from '@angular/core/testing';

import { ManagerPageWBService } from './manager-page-wb.service';
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


  it ('doGetPcsFacetsFromPcs Affine', () => {
    const pcs = new IPcs({strPcs:"0, 4, 7"})
    expect(service.doGetPcsFacetsFromPcs(pcs, 'Affine', true).length).toEqual(4)

    const pcsLimitedTransposition = new IPcs({strPcs:"0, 3, 6, 9"})
    expect(service.doGetPcsFacetsFromPcs(pcsLimitedTransposition, 'Affine', true).length).toEqual(1)
    expect(service.doGetPcsFacetsFromPcs(pcsLimitedTransposition, 'Affine', false).length).toEqual(4)
  })

  it ('doGetPcsFacetsFromPcs Musaic', () => {
    const pcs = new IPcs({strPcs:"0, 4, 7"})
    expect(service.doGetPcsFacetsFromPcs(pcs, 'Musaic', true).length).toEqual(8)
    expect(service.doGetPcsFacetsFromPcs(pcs, 'Musaic', false).length).toEqual(8)

    const pcsLimitedTransposition = new IPcs({strPcs:"0, 3, 6, 9"})

    // 3 expected, and no 2, because complement (1,2,4,5,7,8,10,11) has intercaler symmetry
    expect(service.doGetPcsFacetsFromPcs(pcsLimitedTransposition, 'Musaic', true).length).toEqual(3)

    expect(service.doGetPcsFacetsFromPcs(pcsLimitedTransposition, 'Musaic', false).length).toEqual(8)
  })

});
