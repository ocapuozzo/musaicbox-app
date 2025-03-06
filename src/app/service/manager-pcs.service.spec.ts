import {TestBed} from '@angular/core/testing';

import {ManagerPcsService} from './manager-pcs.service';
import {IPcs} from "../core/IPcs";
import {ManagerGroupActionService} from "./manager-group-action.service";

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

  it('makeNewInstanceOf', ()=>{
    const pcs5 = new  IPcs({strPcs:"[2 3 7 8 9]"})
    expect(pcs5.iPivot).toEqual(2)

    const pcs5Mus = ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')?.getIPcsInOrbit(pcs5)!
    expect(ManagerPcsService.makeNewInstanceOf(pcs5Mus, pcs5Mus.orbit.groupAction!).iPivot).toEqual(2)
    expect(ManagerPcsService.makeNewInstanceOf(pcs5Mus, pcs5Mus.orbit.groupAction!, 7).iPivot).toEqual(7)

    try {
      expect(ManagerPcsService.makeNewInstanceOf(pcs5Mus, pcs5Mus.orbit.groupAction!, 1).iPivot).toEqual(1) // error
      fail("Do not pass here")
    }catch (e:any) {
      expect(e.message).toContain('bad iPivot')
    }

  })

});
