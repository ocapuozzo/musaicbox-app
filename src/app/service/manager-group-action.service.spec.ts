import {TestBed} from '@angular/core/testing';

import {ManagerGroupActionService} from './manager-group-action.service';
import {IPcs} from "../core/IPcs";

describe('ManagerGroupActionService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({});

  });

  it('ManagerGroupActionService initialized', () => {
    // static methods and data
    expect(ManagerGroupActionService.GROUP_ACTION_INSTANCES).toBeTruthy()
  })

  it('ManagerGroupActionService Trivial', () => {
    const groupAction = ManagerGroupActionService.getGroupActionFromGroupName("n=12 []")
    // REM  "n=12 []"  <>  "n=12 [M1]" because Mx are for all Mx-T1, so we note MX,
    // expect trivial group (only neutral op - M1-T0 is not represented)
    expect(groupAction).toBeTruthy()
    expect(groupAction!.orbits.length).toEqual(4096)
  })

  it('ManagerGroupActionService Affine', () => {
    const groupAction = ManagerGroupActionService.getGroupActionFromGroupName("n=12 [M1 M5 M7 M11]")
    expect(groupAction).toBeTruthy()
    expect(groupAction!.orbits.length).toEqual(158)
  })

  it('ManagerGroupActionService Dihedral', () => {
    const groupAction = ManagerGroupActionService.getGroupActionFromGroupName("n=12 [M1 M11]")
    expect(groupAction).toBeTruthy()
    expect(groupAction!.orbits.length).toEqual(224)
  })

  it('ManagerGroupActionService get Affine by alias name', () => {
    const groupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName("Affine")
    expect(groupAction).toBeTruthy()
    expect(groupAction!.orbits.length).toEqual(158)
  })

  it('Cyclic prime form ', () => {
    const cyclicGroupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")
    const pcsId88 = new IPcs({pidVal: 88})
    const pcsPrimeFormOfPcsId88 = new IPcs({pidVal: 11})
    const primeFormFromGroupAction = cyclicGroupAction?.getOrbitOf(pcsId88).getPcsMin()

    const n = pcsId88.abinPcs.length;
    let norm: number[] = pcsId88.abinPcs.slice();
    let min = norm;
    let minInt = IPcs.id(pcsId88.abinPcs);

    for (let i = 0; i < n - 1; i++) {
      norm = IPcs.getBinPcsPermute(1, 1, 0, norm);
      let curInt = IPcs.id(norm);
      if (minInt > curInt) {
        minInt = curInt;
        min = norm;
      }
    }
    const primeFormComputed = new IPcs({binPcs: min, iPivot: 0})

    expect(primeFormFromGroupAction).toBeTruthy()
    expect(pcsPrimeFormOfPcsId88.id).toEqual(primeFormFromGroupAction!.id)
    expect(primeFormFromGroupAction!.id).toEqual(primeFormComputed.id)

    expect(primeFormComputed.id).toEqual(pcsId88.cyclicPrimeForm().id)

  })

  it('Dihedral prime form (n=12)', () => {
    const dihedralGroupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")
    const pcsDminor = new IPcs({strPcs: '2,5,9'})
    const pcsCMaj = new IPcs({strPcs: '0,4,7'})
    const pcsCminor = new IPcs({strPcs: '0,3,7'})

    const primeFormFromGroupAction = dihedralGroupAction?.getOrbitOf(pcsDminor).getPcsMin()
    expect(primeFormFromGroupAction).toBeTruthy()

    const cyclicGroupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")

    const pcsCyclicPfOfDm = cyclicGroupAction?.getOrbitOf(pcsDminor).getPcsMin()
    const pcsPfInverseOfDmPf = pcsCyclicPfOfDm!.affineOp(11, 0).cyclicPrimeForm();

    const smaller = pcsCyclicPfOfDm!.id < pcsPfInverseOfDmPf.id ? pcsCyclicPfOfDm : pcsPfInverseOfDmPf;

    expect(pcsPfInverseOfDmPf.id).toEqual(pcsCMaj.id)
    expect(smaller!.id).toEqual(pcsCminor.id)
    expect(smaller!.id).toEqual(primeFormFromGroupAction!.id)
    expect(smaller!.id).toEqual(pcsCMaj.dihedralPrimeForm().id)
    expect(smaller!.id).toEqual(pcsDminor.dihedralPrimeForm().id)
    expect(smaller!.id).toEqual(pcsCminor.dihedralPrimeForm().id)

  })

  it('Affine Prime Form (n=12)', () => {
    const pcsCMaj = new IPcs({strPcs: '0,4,7'})
    const pcsPfAffineOfCMaj = new IPcs({strPcs: '0,1,4'})

    const pcsDihedralPfOfCMaj = pcsCMaj.dihedralPrimeForm(); // call ManagerGroupActionService logic

    const pcsM5 = pcsDihedralPfOfCMaj.affineOp(5, 0).cyclicPrimeForm();
    const pcsM7 = pcsDihedralPfOfCMaj.affineOp(7, 0).cyclicPrimeForm();
    const smaller =
      (pcsDihedralPfOfCMaj.id < pcsM5.id && pcsDihedralPfOfCMaj.id < pcsM7.id) ?
       pcsDihedralPfOfCMaj : (pcsM5.id < pcsM7.id) ? pcsM5 : pcsM7

    expect(pcsPfAffineOfCMaj.id).toEqual(smaller.id)
    expect(smaller.id).toEqual(pcsCMaj.affinePrimeForm().id)

  })

  it('Musaic Prime Form (n=12)', () => {
    const pcsMajDiato = new IPcs({strPcs: '0,2,4,5,7,9,11'})
    const pcsPfMusaicOfMajDiato = new IPcs({strPcs: '0,1,2,3,4'})

    const pcsAffine = pcsMajDiato.affinePrimeForm(); // call ManagerGroupActionService logic
    const pcsAffineCplt = pcsAffine.complement().affinePrimeForm();
    const smaller =
      (pcsAffine.id < pcsAffineCplt.id) ? pcsAffine : pcsAffineCplt

    expect(smaller.id).toEqual(pcsPfMusaicOfMajDiato.id)
    expect(smaller.id).toEqual(pcsMajDiato.musaicPrimeForm().id)
  })

});