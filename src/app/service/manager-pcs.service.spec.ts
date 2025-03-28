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

  it(' isComingFromAnOrbit complement state or not', () => {
    const ipcsWithNoOrbit = new IPcs({strPcs: "0, 3, 5, 8", iPivot: 0})
    expect(ipcsWithNoOrbit.isComingFromOrbit()).toBeFalse()

    const ipcsMusaicPF = ipcsWithNoOrbit.musaicPrimeForm()
    expect(ipcsMusaicPF.isComingFromOrbit()).toBeTrue()

    // difference between service or not
    expect(managerPcsService.complement(ipcsMusaicPF).isComingFromOrbit()).toBeTrue()
   // expect(ipcsMusaicPF.complement().isComingFromAnOrbit()).toBeFalse()

    // when pcs is not coming from orbit, then stay with this state after complement
    expect(managerPcsService.complement(ipcsWithNoOrbit).isComingFromOrbit()).toBeFalse()

  });

  it('complement under pcs mapped', () => {
    const cmaj7Mapped = new IPcs({strPcs: "0, 2, 4, 6", n:7, nMapping:12, templateMapping:[0,2,4,5,7,9,11], iPivot: 0})
    expect(cmaj7Mapped.n).toEqual(7)
    expect(cmaj7Mapped.vectorPcs).toEqual([1,0,1,0,1,0,1])
    expect(cmaj7Mapped.complement().vectorPcs).toEqual(cmaj7Mapped.vectorPcs.map(pc => pc === 1 ? 0 : 1))
  })


  it('doTransformeAffine', () => {
    const pcs = new IPcs({strPcs: "0, 1, 11", iPivot: 0})
    const pcs2 = new IPcs({strPcs: "0, 1, 2", iPivot: 1})
    expect(managerPcsService.doTransformAffine(pcs, 1, 1).id).toEqual(pcs2.id)
  })

  it('transformeByMxT0', () => {
    const pcs = new IPcs({strPcs: "0, 4, 7, 11", iPivot: 0})
    const pcsTime5 = new IPcs({strPcs: "0, 8, 11, 7", iPivot: 0})
    expect(managerPcsService.transformByMxT0(pcs, 1).id).toEqual(pcs.id)
    expect(managerPcsService.transformByMxT0(pcs, 5).id).toEqual(pcsTime5.id)
  });

  it('translateByM1Tx', () => {
    const pcs = new IPcs({strPcs: "0, 4, 7, 11"})
    const pcsPlus1 = new IPcs({strPcs: "1, 5, 8, 0"})
    const pcsPlus2 = new IPcs({strPcs: "2, 6, 9, 1"})

    expect(managerPcsService.translateByM1Tx(pcs, 1).id).toEqual(pcsPlus1.id)
    expect(managerPcsService.translateByM1Tx(pcs, 2).id).toEqual(pcsPlus2.id)
  });

  it('modulation', () => {
    const pcs = new IPcs({strPcs: "0, 4, 7, 11"})
    expect(managerPcsService.modulation(pcs, "Next").iPivot).toEqual(4)
    expect(managerPcsService.modulation(pcs, "Previous").iPivot).toEqual(11)
  });


  it(' changePivotBy', () =>{
    const pcs5 = new  IPcs({strPcs:"[2 3 7 8 9]"})
    expect(pcs5.iPivot).toEqual(2)
    expect(managerPcsService.changePivotBy(pcs5, 7).iPivot).toEqual(7)
    try {
      expect(managerPcsService.changePivotBy(pcs5, 0).iPivot).toEqual(7)
      fail('Do not pass here, because Invalid iPivot ')
    } catch (e: any) {
      expect(e.message).toContain('Invalid iPivot')
    }
  })

  it('toggleIndex', () => {
    const pcs5 = new  IPcs({strPcs:"[2 3 7 8 9]"})
    expect(pcs5.cardinal).toEqual(5)
    expect(managerPcsService.toggleIndex(pcs5, 7).cardinal).toEqual(4)
    expect(managerPcsService.toggleIndex(pcs5, 0).cardinal).toEqual(6)
    try {
      expect(managerPcsService.toggleIndex(pcs5, 12).cardinal).toEqual(6)
      fail('Do not pass here, because Invalid index ')
    } catch (e: any) {
      expect(e.message).toContain('Invalid index')
    }
  });


  it('makeNewInstanceOf', ()=>{
    const pcs5 = new  IPcs({strPcs:"[2 3 7 8 9]"})
    expect(pcs5.iPivot).toEqual(2)

    const pcs5Mus = ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')?.getIPcsInOrbit(pcs5)!
    expect(pcs5Mus.getOrMakeInstanceFromOrbitOfGroupActionOf(pcs5Mus.orbit.groupAction!).iPivot).toEqual(2)
    expect(pcs5Mus.getOrMakeInstanceFromOrbitOfGroupActionOf(pcs5Mus.orbit.groupAction!, 7).iPivot).toEqual(7)

    try {
      expect(pcs5Mus.getOrMakeInstanceFromOrbitOfGroupActionOf(pcs5Mus.orbit.groupAction!, 1).iPivot).toEqual(1) // error
      fail("Do not pass here")
    }catch (e:any) {
      expect(e.message).toContain('bad iPivot')
    }

  })

});
