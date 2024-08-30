import { TestBed } from '@angular/core/testing';

import { ManagerPcsService } from './manager-pcs.service';
import {IPcs} from "../core/IPcs";

describe('ManagerPcsService', () => {
  let managerPcsService: ManagerPcsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    managerPcsService = TestBed.inject(ManagerPcsService);
  });

  it('should be created', () => {
    expect(managerPcsService).toBeTruthy();
  });

  it(' detached complement state or not', () => {
    const ipcsWithNoOrbit = new IPcs({strPcs: "0, 3, 5, 8", iPivot: 0})
    expect(ipcsWithNoOrbit.isDetached()).toBeTruthy()

    const ipcsMusaicPF = ipcsWithNoOrbit.musaicPrimeForm()
    expect(ipcsMusaicPF.isDetached()).not.toBeTruthy()

    // difference between service or not
    expect(managerPcsService.complement(ipcsMusaicPF).isDetached()).not.toBeTruthy()
    expect(ipcsMusaicPF.complement().isDetached()).toBeTruthy()

    // when pcs is detached, then stay detached after op
    expect(managerPcsService.complement(ipcsWithNoOrbit).isDetached()).toBeTruthy()

  });

  it('doTransformeAffine', () => {
    const pcs = new IPcs({strPcs: "0, 1, 11", iPivot: 0})
    const pcs2 = new IPcs({strPcs: "0, 1, 2", iPivot: 1})
    expect(managerPcsService.doTransformAffine(pcs, 1, 1).id).toEqual(pcs2.id)
  })

  it('transformeByMxT0', () => {

  });

  it('translateByM1Tx', () => {

  });

  it('modulation', () => {

  });

  it('toggleInnerIndexOrSetIPivot', () => {

  });

  it('toggleIndexFromMapped', () => {

  });


  it('doDetach', () => {

  });


});
