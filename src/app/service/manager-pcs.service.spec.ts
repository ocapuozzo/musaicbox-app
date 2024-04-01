import { TestBed } from '@angular/core/testing';

import { ManagerPcsService } from './manager-pcs.service';
import {IPcs} from "../core/IPcs";

describe('ManagerPcsService', () => {
  let service: ManagerPcsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPcsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(' detached complement state or not', () => {
    const ipcsWithNoOrbit = new IPcs({strPcs: "0, 3, 5, 8", iPivot: 0})
    expect(ipcsWithNoOrbit.isDetached()).toBeTruthy()

    const ipcsMusaicPF = ipcsWithNoOrbit.musaicPrimeForm()
    expect(ipcsMusaicPF.isDetached()).not.toBeTruthy()

    // difference between service or not
    expect(service.complement(ipcsMusaicPF).isDetached()).not.toBeTruthy()
    expect(ipcsMusaicPF.complement().isDetached()).toBeTruthy()

    // when pcs is detached, then stay detached after op
    expect(service.complement(ipcsWithNoOrbit).isDetached()).toBeTruthy()

  });

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
