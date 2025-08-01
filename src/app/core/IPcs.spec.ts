import {IPcs, modulo} from './IPcs'
import {GroupAction} from "./GroupAction";
import {ManagerGroupActionService} from "../service/manager-group-action.service";
import {MusaicOperation} from "./MusaicOperation";
import {Orbit} from "./Orbit";


describe('IPcs unit tests', () => {

  it("IPcs constructor with iPivot = 0", () => {
    const ipcs = new IPcs({strPcs: "0,4,7"});
    expect(ipcs.iPivot).toEqual(0);
  });

  it("IPcs constructor with no iPivot > 0", () => {
    const ipcs = new IPcs({strPcs: "3,4,7"})
    expect(ipcs.iPivot).toEqual(3);
  });

  it("IPcs constructor with iPivot > 0", () => {
    const pcs1 = new IPcs({strPcs: "4,0,7"})
    expect(pcs1.iPivot).toEqual(4);

    const pcs2 = new IPcs({strPcs: "407"})
    expect(pcs2.iPivot).toEqual(4);

    let pcs = new IPcs({strPcs: "470"})
    expect(pcs.iPivot).toEqual(4);

    pcs = new IPcs({strPcs: "740"})
    expect(pcs.iPivot).toEqual(7);

    const pcs3 = new IPcs({strPcs: "11407"})
    expect(pcs3.iPivot).toEqual(11);

  });


  it("IPcs bad constructor with bad n ", () => {
    try {
      const ipcsDiatMajMapped = new IPcs({
        strPcs: "[0, 2, 7]",  // 7 not in [0..7[ but 7 Modulo 7 => 0
        n: 7,
        nMapping: 12,
        templateMapping: [0, 2, 4, 5, 7, 9, 11]
      })
      expect(ipcsDiatMajMapped.n).toEqual(7)
      expect(ipcsDiatMajMapped.vectorPcs).toEqual([1, 0, 1, 0, 0, 0, 0])
    } catch (e: any) {
      expect().nothing()
    }
  });

  it("IPcs constructor with strPcs:'{0, 4, 7}' ", () => {
    const ipcsCMajor: IPcs = new IPcs({
      strPcs: "{0, 4, 7}"
    })
    expect(ipcsCMajor).toBeTruthy()
    expect(ipcsCMajor.n).toEqual(12)
    expect(ipcsCMajor.getMappedVectorPcs()).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0])
  });

  it("IPcs constructor with strPcs:'[0, 4, 7]' ", () => {
    const ipcsCMajor: IPcs = new IPcs({
      strPcs: "[0, 4, 7]"
    })
    expect(ipcsCMajor).toBeTruthy()
    expect(ipcsCMajor.n).toEqual(12)
    expect(ipcsCMajor.getMappedVectorPcs()).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0])
  });

  it("IPcs constructor with nMapping ", () => {
    const pcs: IPcs = new IPcs({strPcs: "[0, 4, 7]"})
    expect(pcs.templateMapping.length).toEqual(12)
    expect(pcs.getMappedVectorPcs().length).toEqual(12)
    expect(pcs.templateMapping.length).toEqual(12)

    let nMapping = 12
    let templateMapping = undefined

    const ipcsCMajor: IPcs = new IPcs({
      iPivotParam: 0,
      strPcs: "[0, 4, 7]",
      //n:12,
      nMapping: nMapping,
      templateMapping: templateMapping ?? [] //undefined
    })

    expect(ipcsCMajor).toBeTruthy()
    expect(ipcsCMajor.n).toEqual(12)
    expect(ipcsCMajor.getPcsStr()).toEqual("[0 4 7]")
    expect(ipcsCMajor.getMappedVectorPcs().length).toEqual(12)
    expect(ipcsCMajor.templateMapping.length).toEqual(12)

    const chord = new IPcs({
      strPcs: "0 2 4",
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]
    })
    expect(chord.getPcsStr()).toEqual("[0 2 4]")

    const chord2 = new IPcs({
      strPcs: "[0 2 4 6]",
      iPivotParam: 0,
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]
    })
    expect(chord2.n).toEqual(7)
    expect(chord2.templateMapping).toEqual([0, 2, 4, 5, 7, 9, 11])

  });

  it('negativeToPositiveModulo', () => {
    expect(modulo(0, 12)).toEqual(0)
    expect(modulo(1, 12)).toEqual(1)
    expect(modulo(-1, 12)).toEqual(11)
    expect(modulo(-6, 12)).toEqual(6)
  })

  it('Test for detect bug with pivot not set', () => {
    let pcs = new IPcs({strPcs: ""})
    expect(MusaicOperation.permute(pcs, 1, 0).iPivot).toEqual(0)
    expect(pcs.affineOp(1, 0).iPivot).toEqual(0)
    expect(pcs.toggleIndexPC(1).iPivot).toEqual(1)
  })

  it("IPcs constructor with bad nMapping ", () => {
    try {
      let pcs: IPcs = new IPcs({strPcs: "[0, 4, 7]", nMapping: 3})
      expect(pcs).not.toBeDefined()
    } catch (e: any) {
      expect(e.message).toContain('Invalid data mapping')
    }

    let pcs = new IPcs({
      strPcs: "[0, 4, 7]",
      templateMapping: [0, 2, 3, 0, 2, 3, 0, 2, 3, 0, 2, 3, 0, 2, 3]
    })
    // auto fix
    expect(pcs.templateMapping.length).toEqual(12)
  })

  it("IPcs bad empty constructor", () => {
    try {
      const ipcs: IPcs = new IPcs(
        {}
      )
      expect(ipcs).not.toBeTruthy()
    } catch (e: any) {
      expect(e.message).toContain('bad args')
    }
    // really empty args
    try {
      const ipcs: IPcs = new IPcs()
      expect(ipcs).not.toBeTruthy()
    } catch (e: any) {
      expect(e.message).toContain('bad args')
    }

  });

  it("pcsStr", () => {
    const ipcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // mapped into [0,4,7] {C E G}
    })
    expect(ipcsDiatMajMapped.getPcsStr()).toEqual('[0 2 4]')
    expect(ipcsDiatMajMapped.unMap().getPcsStr()).toEqual('[0 4 7]')
  })

  it("toString", () => {
    const pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // mapped into [0,4,7] {C E G}
    })
    expect(pcsDiatMajMapped.toString()).toEqual('[1,0,1,0,1,0,0] n = 7, iPivot = 0 Mapped on 12')

    const pcsDefaultMapping = new IPcs({
      strPcs: "[0, 4, 7]"
    })
    expect(pcsDefaultMapping.toString()).toEqual('[1,0,0,0,1,0,0,1,0,0,0,0] n = 12, iPivot = 0')
  })

  it("IPcs cardinal", () => {
    const ipcs = new IPcs({strPcs: "0,4,7", iPivotParam: 0})
    expect(ipcs.cardinal).toEqual(3);
  });

  it("IPcs transposition + 1", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    const ipcs_plus_one = new IPcs({strPcs: "1,5,0", iPivotParam: 1})

    expect(ipcs.transposition(1)).toEqual(ipcs_plus_one);
  });

  it("IPcs transposition - 1", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    const ipcs_minus_one = new IPcs({strPcs: "11,3,10", iPivotParam: 11})

    expect(ipcs.transposition(-1)).toEqual(ipcs_minus_one);
  });

  it("IPcs transposition - 12", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    const ipcs_other = new IPcs({strPcs: "0,11,4", iPivotParam: 0})

    expect(ipcs.transposition(-12)).toEqual(ipcs_other);
  });

  it("IPcs transposition + 12+6", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    const ipcs_other = new IPcs({strPcs: "6,10,5", iPivotParam: 6})

    expect(ipcs.transposition(18)).toEqual(ipcs_other);
  });

  it("IPcs modulation NEXT ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    let ipcs_other1
    let ipcs_other2 = new IPcs({strPcs: "0,4,11", iPivotParam: 4})

    expect(ipcs.modulation("Next")).toEqual(ipcs_other2);
    ipcs_other1 = new IPcs({strPcs: "0,4,11", iPivotParam: 11})
    expect(ipcs_other2.modulation("Next")).toEqual(ipcs_other1);
    ipcs_other2 = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    expect(ipcs_other1.modulation("Next")).toEqual(ipcs_other2);


    let diatMaj = new IPcs({strPcs: "0 2 4 5 7 9 11", iPivotParam: 0})
    const pcsInMusicGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')?.getIPcsInOrbit(diatMaj)!
    expect(pcsInMusicGroup.isComingFromOrbit()).toBeTrue()
    expect(pcsInMusicGroup.modulation("Next").isComingFromOrbit()).toBeTrue()
  });

  it("IPcs cardinal PREVIOUS", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    const ipcs_other = new IPcs({strPcs: "0,4,11", iPivotParam: 11})

    expect(ipcs.modulation("Previous")).toEqual(ipcs_other);
  });

  it("IPcs equals ok ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    const ipcs_other = new IPcs({strPcs: "11,4,0", iPivotParam: 0})

    expect(ipcs.equals(ipcs_other)).toBeTruthy();
  });

  it("IPcs equals with not same pivot ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivotParam: 0})
    const ipcs_other = new IPcs({strPcs: "0,4,11", iPivotParam: 11})

    expect(ipcs.equals(ipcs_other)).toBeTruthy();
    expect(ipcs.equalsPcsById(ipcs_other)).toBeTruthy();
  });

  it("IPcs complement ", () => {
    const ipcs = new IPcs({strPcs: "0,2,4,5,7,9,11", iPivotParam: 0})
    const ipcs_complement = new IPcs({strPcs: "1,3,6,8,10", iPivotParam: 6})
    const complement = ipcs.complement()

    const cpltcplt = complement.complement()

    expect(complement.equals(ipcs_complement)).toBeTrue()
    expect(cpltcplt.equals(ipcs)).toBeTrue()

    let pcsTest = new IPcs({strPcs: "0 4 5"})
    expect(pcsTest.iPivot).toEqual(0)
    expect(pcsTest.complement().iPivot).toEqual(1)


  });

  it("IPcs complement max/empty", () => {
    const ipcs12pc = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivotParam: 0})
    try {
      expect(ipcs12pc.cardinal).toEqual(12)
      const complement = ipcs12pc.complement()
      expect(complement.cardinal).toEqual(0)
    } catch (e: any) {
      expect(e.toString()).toMatch("Not accept empty pcs?")
    }
  });

  it("IPcs cardOrbitMode", () => {
    let ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivotParam: 0})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "1, 4, 7, 10", iPivotParam: 1})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 4, 8", iPivotParam: 0})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 1, 6, 7", iPivotParam: 0})
    expect(ipcs.cardOrbitMode()).toEqual(2)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 1, 2, 3", iPivotParam: 0})
    expect(ipcs.cardOrbitMode()).toEqual(4)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivotParam: 0})
    expect(ipcs.cardOrbitMode()).toEqual(7)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))


    ipcs = new IPcs({strPcs: "0", n: 12})
    expect(ipcs.cardOrbitMode()).toEqual(1)

    ipcs = new IPcs({strPcs: "", n: 12})
    expect(ipcs.cardOrbitMode()).toEqual(0)
  });

  it("IPcs cardOrbitCyclic", () => {
    let ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().orbit.cardinal).toEqual(3)
    ipcs = ipcs.cyclicPrimeForm()
    // pcs is now attached with good orbit (for good average test)
    expect(ipcs.orbit.cardinal).toEqual(3)

    ipcs = new IPcs({strPcs: "0, 4, 8", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().orbit.cardinal).toEqual(4);
    ipcs = new IPcs({strPcs: "0, 1, 6, 7", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().orbit.cardinal).toEqual(6);
    ipcs = new IPcs({strPcs: "0, 1, 2, 3", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().orbit.cardinal).toEqual(12);
    ipcs = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().orbit.cardinal).toEqual(12);
    ipcs = new IPcs({strPcs: "0, 1, 3, 5, 6, 8, 10", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().orbit.cardinal).toEqual(12);


    let cyclicGroup12 = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!

    ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivotParam: 0})

    let orbit = cyclicGroup12.getOrbitOf(ipcs)
    expect(orbit.cardinal).toEqual(3)

  });

  it("IPcs cyclicPrimeForm", () => {
    let ipcsPF = new IPcs({strPcs: "0, 3, 6, 9", iPivotParam: 0})
    expect(ipcsPF.cyclicPrimeForm().getMappedVectorPcs()).toEqual(ipcsPF.getMappedVectorPcs())
    let ipcs = new IPcs({strPcs: "1, 4, 7, 10", iPivotParam: 1})
    expect(ipcs.cyclicPrimeForm().getMappedVectorPcs()).toEqual(ipcsPF.getMappedVectorPcs())
    ipcs = new IPcs({strPcs: "7", iPivotParam: 7})
    let pcsExpected = new IPcs({strPcs: "0", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().getMappedVectorPcs()).toEqual(pcsExpected.getMappedVectorPcs())
    ipcs = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivotParam: 7})
    pcsExpected = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivotParam: 0})
    expect(ipcs.cyclicPrimeForm().getMappedVectorPcs()).toEqual(pcsExpected.getMappedVectorPcs())
  });

  it("IPcs cyclicPrimeForm from pcs with orbit set", () => {
    let ipcsNotPF = new IPcs({strPcs: "1, 4, 7, 10"})
    expect(ipcsNotPF.isComingFromOrbit()).toBeFalse()
    const groupAction: GroupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
    let ipcsFromGroupActionNotPF: IPcs = groupAction.getIPcsInOrbit(ipcsNotPF)
    expect(ipcsFromGroupActionNotPF.isComingFromOrbit()).toBeTrue()
    let ipcsPF = new IPcs({strPcs: "0, 3, 6, 9", iPivotParam: 0})
    expect(ipcsFromGroupActionNotPF.cyclicPrimeForm().id).toEqual(groupAction.getIPcsInOrbit(ipcsPF).id)
  })

  it("IPcs dihedralPrimeForm example Maj -> Min", () => {
    const cMaj = new IPcs({strPcs: "0, 4, 7"})
    const cMajDihedral = MusaicOperation.affineOp(cMaj, 11, 0)
    expect(cMaj.getMappedVectorPcs()).toEqual(MusaicOperation.affineOp(cMajDihedral, 11, 0).getMappedVectorPcs())

    const cMajDihedralPF = new IPcs({strPcs: "0, 3, 7"})
    expect(cMaj.dihedralPrimeForm().getMappedVectorPcs()).toEqual(cMajDihedralPF.getMappedVectorPcs())
    expect(cMaj.dihedralPrimeForm().getMappedVectorPcs()).toEqual(cMajDihedralPF.getMappedVectorPcs())

    // test when pcs have already good orbit
    const ipcs2 = cMaj.dihedralPrimeForm()
    expect(ipcs2.getMappedVectorPcs()).toEqual(ipcs2.transposition(2).dihedralPrimeForm().getMappedVectorPcs())
  })

  it("IPcs affinePrimeForm", () => {
    const cMaj = new IPcs({strPcs: "0, 4, 7"})
    const cMajDihedral = MusaicOperation.affineOp(cMaj, 11, 0)
    let ipcs = MusaicOperation.affineOp(cMajDihedral, 5, 0)
    expect(ipcs.getMappedVectorPcs()).toEqual([1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0])
    expect(ipcs.getMappedVectorPcs()).toEqual(cMaj.affinePrimeForm().getMappedVectorPcs())

    // test when pcs have already good orbit
    const ipcs2 = cMaj.affinePrimeForm()
    expect(ipcs2.getMappedVectorPcs()).toEqual(ipcs2.transposition(2).affinePrimeForm().getMappedVectorPcs())
  })


  it("IPcs musaicPrimeForm", () => {
    const ipcsWithNoOrbit = new IPcs({strPcs: "0, 3, 5, 8", iPivotParam: 0})

    // page 1171 de ToposOfMusic
    const ipcsMusaicPF = new IPcs({strPcs: "0, 1, 3, 4", iPivotParam: 0})
    const primeForm = ipcsWithNoOrbit.musaicPrimeForm()
    expect(primeForm.id).toEqual(ipcsMusaicPF.id)

    expect(primeForm.isComingFromOrbit()).toBeTrue()

    // TODO with orbit or no
    // const ipcsWithOrbit = primeForm.transposition(1)
    // // only ManagerPcsService manage state orbit
    // expect(ipcsWithOrbit.isComingFromAnOrbit()).toBeFalse()
    // expect(primeForm).toEqual(ipcsWithOrbit.musaicPrimeForm())
  });


  it("IPcs Set by Map then sort and convert to Array", () => {
    let ipcs1 = new IPcs({strPcs: "1, 4, 6, 9", iPivotParam: 1})
    let ipcs2 = new IPcs({strPcs: "0, 3, 5, 8", iPivotParam: 0})
    let ipcs3 = new IPcs({strPcs: "0, 3, 5, 8"})
    let map = new Map()
    map.set(ipcs1.id, ipcs1)
    map.set(ipcs2.id, ipcs2)
    map.set(ipcs3.id, ipcs3)
    expect(map.size).toEqual(2)

    // https://stackoverflow.com/questions/28718641/transforming-a-javascript-iterator-into-an-array
    expect(Array.from(map.keys())[0]).toEqual(ipcs1.id)

    // test sort (integer order on id)
    map = new Map([...map.entries()].sort())
    expect(Array.from(map.keys())[0]).toEqual(ipcs2.id)

    // get ordered array from map object
    let theIpcs = Array.from(map.values());
    expect(theIpcs[0]).toEqual(ipcs2)
  });


  it("IPcs Set by Array", () => {
    let ipcs1 = new IPcs({strPcs: "1, 4, 6, 9", iPivotParam: 1})
    let ipcs2 = new IPcs({strPcs: "0, 3, 5, 8"})
    let ipcs3 = new IPcs({strPcs: "0, 3, 5, 8"})
    let tab = []
    tab.push(ipcs1)
    tab.push(ipcs2)
    if (!tab.find(ipcs => ipcs.id === ipcs3.id))
      tab.push(ipcs3)

    expect(tab.length).toEqual(2)

    // let tabsort = tab.sort( (pcsa, pcsb) => pcsa.id - pcsb.id)
    let tabsort = tab.sort(IPcs.compare)

    // get min
    expect(tabsort[0].equals(ipcs2)).toBeTruthy();
  });

  it("IPcs id ", () => {
    let ipcs1 = new IPcs({strPcs: ""})
    let ipcs2 = new IPcs({strPcs: "0"})
    let ipcs3 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11"})
    expect(ipcs1.id).toEqual(0)
    expect(ipcs2.id).toEqual(1 + Math.pow(2, 12))
    expect(ipcs3.id).toEqual(Math.pow(2, 12) - 1 + 12 * Math.pow(2, 12))
  })

  it("IPcs pid by simple polynomial function", () => {
    let ipcs1 = new IPcs({strPcs: ""})
    let ipcs2 = new IPcs({strPcs: "0"})
    let ipcs3 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11"})
    expect(ipcs1.pid()).toEqual(0)
    expect(ipcs2.pid()).toEqual(1)
    expect(ipcs3.pid()).toEqual(Math.pow(2, 12) - 1)
  })

  it("IPcs symmetry prime form", () => {
    let ipcs1 = new IPcs({strPcs: ""})
    let ipcs2 = new IPcs({strPcs: "0"})
    let ipcs3 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivotParam: 4})
    let ipcs4 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivotParam: 0})

    expect(ipcs3.symmetryPrimeForm().id).toEqual(ipcs4.id)
    expect(ipcs3.symmetryPrimeForm().id).toEqual(ipcs4.id) // no side effect

    expect(ipcs2.symmetryPrimeForm().id).toEqual(ipcs2.id)
    expect(ipcs1.symmetryPrimeForm().id).toEqual(ipcs1.id)

    let Emin_5plus = new IPcs({strPcs: "0, 4, 7", iPivotParam: 4})
    let CMaj = new IPcs({strPcs: "0, 4, 7", iPivotParam: 0})

    expect(Emin_5plus.symmetryPrimeForm().id).toEqual(CMaj.id)
    expect(Emin_5plus.symmetryPrimeForm().iPivot).toEqual(0) // cyclic prime for ??

    let diatMaj = new IPcs({strPcs: "0 2 4 5 7 9 11", iPivotParam: 0})
    let dorianFromPc0 = new IPcs({strPcs: "0 2 3 5 7 9 10", iPivotParam: 0})
    expect(diatMaj.symmetryPrimeForm().iPivot).toEqual(0)

    // console.log(diatMaj.symmetryPrimeForm().getPcsStr())

    expect(diatMaj.symmetryPrimeForm().equals(dorianFromPc0)).toBeTrue()

    // let pcs  = new IPcs({strPcs:"0 1 2 4 5 6"})
    // expect(pcs.symmetryPrimeForm())

    let pcs = new IPcs({strPcs: "1 2 6 7"})
    let pcsSym = new IPcs({strPcs: "10 2 3 9"})

    expect(pcs.symmetryPrimeForm().equals(pcsSym)).toBeTrue()
    expect(pcs.symmetryPrimeForm().iPivot).toEqual(10) // Intervallic Structure no shifted

    let empty = new IPcs({strPcs: ""})
    expect(empty.iPivot).toEqual(0)
    expect(empty.symmetryPrimeForm().iPivot).toEqual(0)
    expect(empty.symmetryPrimeForm().id).toEqual(empty.id)

    const pcsInMusicGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')?.getIPcsInOrbit(diatMaj)!
    expect(pcsInMusicGroup.isComingFromOrbit()).toBeTrue()
    expect(pcsInMusicGroup.symmetryPrimeForm().isComingFromOrbit()).toBeTrue()

    // difficult case :  1 3 6 7 9 10, pass by CM11 and all others steps
    let kothimic = new IPcs({strPcs: "1 3 6 7 9 10"})
    let kothimicSymPF = new IPcs({strPcs: "11 4 5 7 8 1"}) //axial symmetry
    // let kothimicSymPF = new IPcs({strPcs: "0 1 3 4 7 9"})
    expect(kothimic.symmetryPrimeForm().equals(kothimicSymPF)).toBeTrue()
    expect(kothimic.iPivot).toEqual(1)
    // expect(kothimicSymPF.iPivot).toEqual(11)
    expect(kothimicSymPF.iPivot).toEqual(11)
    // Axial logic
    //   check good pivot = 4, it is not with Tk minimal (pivot 11 => M11-T2)
    //   but pcs in symmetry 1 4 5 7 8 11 has 2 stab in T0 : M1-T0 and M7-T0, what is preferred (with M11-T4)
    expect(kothimic.symmetryPrimeForm().iPivot).toEqual(11)

    // 0 1 3 4 7 9
    // Cd eE  G A  https://www.daqarta.com/dw_ss0a.htm
    let bluesDorianHex = new IPcs({strPcs: "0 1 3 4 7 9"})
    let bluesDorianHexSymmetric = new IPcs({strPcs: "1 4 5 7 8 11"})   // axial symmetry
    expect(bluesDorianHexSymmetric.equals(bluesDorianHex.symmetryPrimeForm())).toBeTrue()
    expect(bluesDorianHex.symmetryPrimeForm().iPivot).toEqual(11)
    //   if pivot = 11 stab =  M1-T0 M5-T8 M7-T6 M11-T2  (1 sym in -T0  min M11-T2)
    //   if pivot = 4 stab =  M1-T0 M5-T4 M7-T0 M11-T4   (2 sym in -T0  and M11-T4) <= good solution !!!
    //      see musaic 85

    const pcs5 = new IPcs({strPcs: "[2 3 7 8 9]"})
    const pcs5SPF = new IPcs({strPcs: "[0 4 5 6 11]"})
    expect(pcs5.symmetryPrimeForm().equals(pcs5SPF)).toBeTrue()
    expect(pcs5.symmetryPrimeForm().iPivot).toEqual(0) // // M7-T0 stab

    const pcs5Mus = ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')?.getIPcsInOrbit(pcs5)!
    expect(pcs5Mus.symmetryPrimeForm().equals(pcs5SPF)).toBeTrue()
    expect(pcs5Mus.symmetryPrimeForm().iPivot).toEqual(0) // // M7-T0 stab

    const pcs5Cyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName('Cyclic')?.getIPcsInOrbit(pcs5)!
    expect(pcs5Cyclic.symmetryPrimeForm().equals(pcs5SPF)).toBeTrue()
    expect(pcs5Cyclic.symmetryPrimeForm().iPivot).toEqual(0) // // M7-T0 stab
  })

  it("IPcs symmetry prime form Orbit", () => {
    const pcs = new IPcs({strPcs: "0 3 6 9"})
    const pcsInOrbit =
      ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')?.getIPcsInOrbit(pcs)
    expect(pcsInOrbit).toBeDefined()
    expect(pcsInOrbit!.symmetryPrimeForm().isComingFromOrbit()).toBeTrue()
    expect(pcs.symmetryPrimeForm().isComingFromOrbit()).toBeFalse()
  })


  it("IPcs symmetry prime Z related", () => {
    const pcs1 = new IPcs({strPcs: "0 2 3 5 6 8 9"})
    const pcs2 = new IPcs({strPcs: "0 1 3 4 6 7 9"})

    const pcsSym1 = pcs1.symmetryPrimeForm()
    expect(pcsSym1.iPivot).toEqual(0)
    const pcsSym2 = pcs2.symmetryPrimeForm()
    expect(pcsSym2.iPivot).toEqual(0)
  })

  it("IPcs symmetry M70-6-1-12", () => {
    // M70-6-1-12
    //   Limited Transposition : false
    //   Musaic Limited Transformation : true
    //
    // PF       (Musaic) Stabilizers (8): M1-T0 M5-T4 M7-T3 M11-T7 CM1-T6 CM5-T10 CM7-T9 CM11-T1 pid=#189
    // Symmetry (Musaic) Stabilizers (8): M1-T0 M5-T4 M7-T9 M11-T1 CM1-T6 CM5-T10 CM7-T3 CM11-T7 pid=#2583
    // diff is it that  M11-T7 > M11-T1 ??? same axe but pid PF is inferior to pid Symmetry...
    // TODO: clarify this
    //
    const pcsSym = new IPcs({strPcs: "0 1 2 4 9 11"})
    const pcsPrimeForm = new IPcs({strPcs: "0 2 3 4 5 7"})
    const pcsSym1 = pcsPrimeForm.symmetryPrimeForm()
    expect(pcsSym1.iPivot).toEqual(0)
    expect(pcsSym1.id).toEqual(pcsSym.id) // or
    // expect(pcsSym1.id).toEqual(pcsPrimeForm.id) // ???!!!!!!
  })


/*
  it("getFutureAxialSymmetryPivotForPrepareComplement", () => {
    let pcs = new IPcs({strPcs: '[0,1,2]'})
    expect(pcs.getPivot()).toEqual(0)

    pcs = new IPcs({strPcs: '[1 0 2]'})
    expect(pcs.getPivot()).toEqual(1)

    let pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(7)

    const p3 = pcs.symmetryPrimeForm()
    expect(p3.getPcsStr()).toEqual('[0 1 11]')
    expect(p3.getPivot()).toEqual(0)

    pcs = new IPcs({strPcs: '[4 5 6 7 8]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(10)

    // musaic n° 80
    pcs = new IPcs({strPcs: '[0,2,3,5,6,8]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(7)

    // musaic n° 32
    pcs = new IPcs({strPcs: '[0,3,4,7]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(6)

    // musaic n° 35
    pcs = new IPcs({strPcs: '[0,2,4,8]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(6)

    // musaic n° 64
    pcs = new IPcs({strPcs: '[0,1,2,3,4,6]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(5)

    pcs = new IPcs({strPcs: '[0,1,2,3,4,5,6]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(7)

    pcs = new IPcs({strPcs: '[0,1,2,3,4,5,6,7,8,9,10,11]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(undefined)

    pcs = new IPcs({strPcs: '[]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(0)

    pcs = new IPcs({strPcs: '[0]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(6)

    pcs = new IPcs({strPcs: '[3]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(9)


    pcs = new IPcs({strPcs: '[0 4 5]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(6)
    pcs = new IPcs({strPcs: '[4 5 0]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(10)
    pcs = new IPcs({strPcs: '[5 0 4]'})
    pivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()
    expect(pivot).toEqual(11)

  })
*/

  it("symmetryPrimeForm where symmetry if not possible", () => {
    let pcs = new IPcs({strPcs: '[1,2,6,7,8,9]'})
    let pcsMinSymTk = new IPcs({strPcs: '[0 1 5 6 7 8]'})

    expect(pcsMinSymTk.unMap().equals(pcs.symmetryPrimeForm())).toBeTrue()
    expect(pcsMinSymTk.equals(pcs.symmetryPrimeForm())).toBeTrue()
  })


  it("IPcs symmetry n=12", () => {
    // aug chord one median symmetry
    let ipcs = new IPcs({strPcs: "0, 4, 8"})
    let symmetries = ipcs.getAxialSymmetries()
    let symMedian = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    let symInter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

    // dim chord two symmetries
    ipcs = new IPcs({strPcs: "0, 3, 6, 9"})
    symmetries = ipcs.getAxialSymmetries()
    // console.log("symmetries.symMedian = " + symmetries.symMedian)
    symMedian = [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    symInter = [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

    // empty set => full symmetries
    ipcs = new IPcs({strPcs: ""})
    symmetries = ipcs.getAxialSymmetries()
    symMedian = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
    symInter = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

    // major chord => no symmetry
    ipcs = new IPcs({strPcs: "0, 4, 7"})
    symmetries = ipcs.getAxialSymmetries()
    symMedian = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    symInter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

    // symmetry
    ipcs = new IPcs({strPcs: "0, 2, 3, 5, 8, 9"})
    symmetries = ipcs.getAxialSymmetries()
    symMedian = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    symInter = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

  })

  it("IPcs symmetry n=12 no strat with zero", () => {
    // aug chord one median symmetry
    let ipcs = new IPcs({strPcs: "1, 5, 9"})
    let symmetries = ipcs.getAxialSymmetries()
    let symMedian = [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]
    let symInter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)
    ipcs = new IPcs({strPcs: "1,4,5,6,7,10"})
    symmetries = ipcs.getAxialSymmetries()
    // console.log(symmetries.symMedian)
    // console.log(symmetries.symInter)
    expect(symmetries.symInter).toEqual([0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0])
  })


  it("IPcs symmetry n=7", () => {
    // n = 7
    let ipcs = new IPcs({vectorPcs: [1, 0, 1, 0, 1, 0, 1]})
    let symmetries = ipcs.getAxialSymmetries()
    let symMedian = [0, 0, 0, 1, 0, 0, 0]
    let symInter = [0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

    // empty set => full symmetries
    ipcs = new IPcs({strPcs: "", n: 7})

    symmetries = ipcs.getAxialSymmetries()
    symMedian = [1, 1, 1, 1, 1, 1, 1]
    // n is odd
    symInter = [0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)
  })

  /**
   * @see https://sites.google.com/view/88musaics/88musaicsexplained
   */
  it("IPcs Intervallic Structure function n=12", () => {
    let ipcs = new IPcs({
      vectorPcs: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0]
    })
    expect(ipcs.is()).toEqual([3, 4, 5])
    ipcs = new IPcs({strPcs: "0,2"})
    expect(ipcs.is()).toEqual([2, 10])
    ipcs = new IPcs({strPcs: "4"})
    expect(ipcs.is()).toEqual([0])
    ipcs = new IPcs({strPcs: ""})
    expect(ipcs.is()).toEqual([])
    ipcs = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11"})
    expect(ipcs.is()).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])

    ipcs = new IPcs({strPcs: "1,5,8", iPivotParam: 1}) // 1 ==> iPivot default value here
    expect(ipcs.is()).toEqual([4, 3, 5])

    ipcs = new IPcs({strPcs: "1,5,8", iPivotParam: 5})
    expect(ipcs.is()).toEqual([3, 5, 4])
  })

  it("toggleIndexPC", () => {
    let ipcsDim = new IPcs({strPcs: "0, 3, 6, 9", iPivotParam: 0})
    let ipcsNew = ipcsDim.toggleIndexPC(0)
    expect(ipcsNew.n).toEqual(12)
    expect(ipcsDim.cardinal).toEqual(4)
    expect(ipcsNew.cardinal).toEqual(3)
    expect(ipcsNew.iPivot).toEqual(3)
    let ipcsNew2 = ipcsNew.toggleIndexPC(0)
    expect(ipcsNew2.vectorPcs).toEqual(ipcsDim.vectorPcs)
    // no go back for iPivot...
    expect(ipcsNew2.iPivot).toEqual(3)
  })

  it("toggleIndexPC solo => empty", () => {
    let ipcsOnePitch = new IPcs({strPcs: "6", n: 12, iPivotParam: 6})
    let emptyPcs = new IPcs({strPcs: "", n: 12})
    let ipcsNew = ipcsOnePitch.toggleIndexPC(6)
    expect(ipcsNew).toEqual(emptyPcs)
  })

  it("toggleIndexPC bad index", () => {
    let pcsOnePitch = new IPcs({strPcs: "6", n: 12, iPivotParam: 6})
    try {
      const pcsNew = pcsOnePitch.toggleIndexPC(12)
      fail('pcsNew must not be instantiated')
    } catch (e) {
      expect().nothing()
    }
  })

  it("get new Pivot", () => {
    let pcsMaj = new IPcs({strPcs: "0, 4, 7", iPivotParam: 0})
    let pcsMajPivotThird = new IPcs({strPcs: "0, 4, 7", iPivotParam: 4})
    expect(pcsMaj.cloneWithNewPivot(4)).toEqual(pcsMajPivotThird)
  })

  it("get new bad Pivot", () => {
    let pcsMaj = new IPcs({strPcs: "0, 4, 7", iPivotParam: 0})
    let pcsMajPivotThird = new IPcs({strPcs: "0, 4, 7", iPivotParam: 4})
    try {
      expect(pcsMaj.cloneWithNewPivot(6)).toEqual(pcsMajPivotThird)
      fail("Error expected, because bad new pivot")
    } catch (e: any) {
      // good
      expect().nothing()
    }
  })


  it("get complement() with, or not, this orbit", () => {
    let cyclicGroup12 = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!

    let pcsWithoutOrbit = new IPcs({strPcs: "0, 4, 8", iPivotParam: 0})
    let pcsWithOrbit: IPcs = cyclicGroup12.getIPcsInOrbit(pcsWithoutOrbit)

    expect(pcsWithoutOrbit.isComingFromOrbit()).toBeFalse()
    expect(pcsWithOrbit.isComingFromOrbit()).toBeTrue()

    expect(pcsWithoutOrbit.complement().isComingFromOrbit()).toBeFalse()

  })

  it("equals with same pivot", () => {
    let pcsMajPivot0 = new IPcs({strPcs: "0, 4, 7", iPivotParam: 0})
    let pcsMajBisPivot0 = new IPcs({strPcs: "0, 4, 7", iPivotParam: 0})
    expect(pcsMajPivot0.equals(pcsMajBisPivot0)).toBeTrue()
  })

  it("equals with NOT same pivot", () => {
    let pcsMajPivot0 = new IPcs({strPcs: "0, 4, 7", iPivotParam: 0})
    let pcsMajBisPivot4 = new IPcs({strPcs: "0, 4, 7", iPivotParam: 4})
    expect(pcsMajPivot0.equals(pcsMajBisPivot4)).toBeTrue()
  })


  it("getMappedVectorPcs no mapping", () => {
    let dminor7 = new IPcs({strPcs: "0,2,5,9", iPivotParam: 2})
    expect(dminor7.getMappedVectorPcs()).toEqual([1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0])
  })


  it("autoMAp getMappedVectorPcs 7 diat maj => 12 chromatic", () => {
    let pcsDiatMaj = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivotParam: 2})
    expect(pcsDiatMaj.n).toEqual(12)

    let pcsDiatMajMappedIn12 = pcsDiatMaj.autoMap()

    expect(pcsDiatMajMappedIn12.n).toEqual(7)
    expect(pcsDiatMajMappedIn12.nMapping).toEqual(12)
    expect(pcsDiatMajMappedIn12.getMappedVectorPcs().length).toEqual(12)

    // index of 2 in new templateMapping is 1
    expect(pcsDiatMajMappedIn12.iPivot).toEqual(1)
    // 2 becomes initial pivot again
    expect(pcsDiatMajMappedIn12.unMap().iPivot).toEqual(2)

    // unselect 3 pitches
    let otherPics = pcsDiatMajMappedIn12.toggleIndexPC(1)
    expect(otherPics.id).toEqual(new IPcs({strPcs: '[0, 2, 3, 4, 5, 6]', n: 7}).id)
    otherPics = otherPics.toggleIndexPC(3)
    otherPics = otherPics.toggleIndexPC(5)
    expect(otherPics.id).toEqual(new IPcs({strPcs: '[0, 2, 4, 6]', n: 7}).id)

    // verify state
    expect(otherPics.getMappedVectorPcs().length).toEqual(12)
    expect(otherPics.n).toEqual(7)
    expect(otherPics.cardinal).toEqual(4)
    expect(otherPics.vectorPcs).toEqual([1, 0, 1, 0, 1, 0, 1])

    // verify that getMappedVectorPcs of mapped pcs (n=7) is equals to getMappedVectorPcs of none mapped pcs (n=12)
    let binPcs = new IPcs(
      {strPcs: '[0, 4, 7, 11]', n: 12}).getMappedVectorPcs()
    expect(otherPics.getMappedVectorPcs()).toEqual(binPcs)
  })


  it("autoMap 7 diat maj => 12 - verify transposition", () => {
    let pcsDiatonicMaj = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivotParam: 0})
    let pcsDiatonicMajMappedIn12 = pcsDiatonicMaj.autoMap()

    // [0 2 4 5 7 9 11] => [0 4 7]
    // [1, 1, 1, 1, 1, 1, 1] => [1, 0, 1, 0, 1, 0, 0]
    let otherPcs = pcsDiatonicMajMappedIn12.toggleIndexPC(1)
    otherPcs = otherPcs.toggleIndexPC(3)
    otherPcs = otherPcs.toggleIndexPC(5)
    let firstDegree = otherPcs.toggleIndexPC(6)

    expect(firstDegree.vectorPcs).toEqual([1, 0, 1, 0, 1, 0, 0])

    // verify mapping ok ?
    expect(firstDegree.getMappedVectorPcs())
      .toEqual(new IPcs({strPcs: '[0 4 7]', n: 12}).getMappedVectorPcs())

    // now verify if transposition in 7 has a good impact in 12 mapped
    let otherDegreeIn7 = firstDegree.transposition(1) // C,E,G => D,F,A
    expect(firstDegree.vectorPcs).toEqual([1, 0, 1, 0, 1, 0, 0])
    expect(otherDegreeIn7.vectorPcs).toEqual([0, 1, 0, 1, 0, 1, 0])

    let expectedDminorIn12 = new IPcs({strPcs: "[2 5 9]", n: 12}) // D, F, A
    expect(otherDegreeIn7.getMappedVectorPcs()).toEqual(expectedDminorIn12.getMappedVectorPcs())

    // good ! a little self-satisfaction can't hurt...

  })

  it("unMap 7 diatonic maj => 12", () => {
    const pcsDiatonicMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // mapped in {C E G}
    })

    // verify mapping 7 -> 12
    expect(pcsDiatonicMajMapped.n).toEqual(7)
    expect(pcsDiatonicMajMapped.nMapping).toEqual(12)

    // now get unMap, as 12 -> 12
    const pcsDiatonicMajUnMapped = pcsDiatonicMajMapped.unMap()
    expect(pcsDiatonicMajUnMapped.n).toEqual(12)

    // default mapping is n
    expect(pcsDiatonicMajUnMapped.nMapping).toEqual(12)
    expect(pcsDiatonicMajUnMapped.templateMapping.length).toEqual(12)

    expect(pcsDiatonicMajUnMapped.getMappedVectorPcs().length).toEqual(12)
  })

  it("Default Mapping", () => {
    const pcsDminor = new IPcs({
      strPcs: "[2, 5, 9]", // D minor
      n: 12,
    })
    expect(pcsDminor.nMapping).toEqual(pcsDminor.n)
    expect(pcsDminor.nMapping).toEqual(12)
    expect(pcsDminor.templateMapping).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })


  it("unMap a pcs not mapped", () => {
    const pcsDminor = new IPcs({
      strPcs: "[2, 5, 9]", // D minor
      n: 12,
    })
    expect(pcsDminor.unMap()).toEqual(pcsDminor)

    const pcsCMaj = new IPcs({strPcs: "[0, 4, 7]"})
    expect(pcsCMaj.unMap().pid()).toEqual(pcsCMaj.pid())

    expect(pcsCMaj.unMap().getChordName()).toEqual("CMaj")
  })


  it("getMappedPcsStr", () => {
    const pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // mapped into [0,4,7] {C E G}
    })
    expect(pcsDiatMajMapped.getPcsStr()).toEqual('[0 2 4]')
    expect(pcsDiatMajMapped.getMappedPcsStr()).toEqual('[0 4 7]')

    expect(pcsDiatMajMapped.unMap().getPcsStr()).toEqual('[0 4 7]')
    // default auto-map on himself
    expect(pcsDiatMajMapped.unMap().getMappedPcsStr()).toEqual('[0 4 7]')

  })

  it('indexMappedToIndexInner', () => {
    const pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7] {C E G}
    })
    expect(pcsDiatMajMapped.indexMappedToIndexInner(0)).toEqual(0)
    expect(pcsDiatMajMapped.indexMappedToIndexInner(2)).toEqual(1)
    expect(pcsDiatMajMapped.indexMappedToIndexInner(11)).toEqual(6)

    // test with index out of mapping
    expect(pcsDiatMajMapped.indexMappedToIndexInner(1)).toEqual(-1)
    expect(pcsDiatMajMapped.indexMappedToIndexInner(6)).toEqual(-1)
  })


  it("Forte empty set", () => {
    const pcsEmpty = new IPcs({strPcs: '[]', n: 12})
    expect(pcsEmpty.forteNum()).toEqual('0-1');
  });

  it("Forte [0,6]", () => {
    const pcsEmpty = new IPcs({strPcs: '[0,6]', n: 12})
    expect(pcsEmpty.forteNum()).toEqual('2-6');
  });

  it("Forte [0,1,2,3,6]", () => {
    const pcsEmpty = new IPcs({strPcs: '[0,1,2,3,6]', n: 12})
    // 5-4 or 5-4A
    expect(pcsEmpty.forteNum()).toContain('5-4');
  });

  it("Forte bad pcs", () => {
    const pcsEmpty = new IPcs({strPcs: '[0,1,2,3,6]', n: 7})
    // n != 12
    expect(pcsEmpty.forteNum()).toEqual('');
  });


  it("Forte inversions are marked 8-4B", () => {
    let pcs = new IPcs({strPcs: '[0,1,3,4,5,6,7,8]'})
    // pass by pcs.dihedralPrimeForm().pcsStr
    expect(pcs.forteNum()).toEqual('8-4');
  });

  it("iv Interval Vector of MajChord3pitches", () => {
    const cMaj = new IPcs({strPcs: '[0,4,7]', n: 12})
    expect(cMaj.iv()).toEqual([0, 0, 1, 1, 1, 0]);
  });

  it("is Intervallic Structure", () => {
    const cMaj = new IPcs({strPcs: '[0,4,7]', n: 12})
    //  a Maj chord is composed by : 4 + 3 + 5 semi-tones
    expect(cMaj.is()).toEqual([4, 3, 5]);

    // Sum of elements of IS is n
    expect(cMaj.is().reduce((sum, e) => e + sum)).toEqual(cMaj.n)

    const pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord {C E G}
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7]
    })
    expect(pcsDiatMajMapped.getMappedPcsStr()).toEqual('[0 4 7]')
    expect(pcsDiatMajMapped.is()).toEqual([2, 2, 3]); // in 7

    // Sum of elements of IS is n = 7
    expect(pcsDiatMajMapped.is().reduce((sum, e) => e + sum)).toEqual(pcsDiatMajMapped.n)
  });


  it("isComingFromAnOrbit()", () => {
    const pcsMaj3Pitches: IPcs = new IPcs({
      strPcs: "[0, 4, 7]", // C Major
    })
    expect(pcsMaj3Pitches.isComingFromOrbit()).toBeFalse()

    const pcsPrimeForme = pcsMaj3Pitches.cyclicPrimeForm()
    expect(pcsPrimeForme.isComingFromOrbit()).toBeTrue()
    // because pcsPrimeForm is get from group action
  });


  it("get metaStabilizer", () => {
    const notInOrbitMaj7 = new IPcs({strPcs: '0,4,7,10'})
    const groupMusaic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!

    const inOrbitMaj7 = groupMusaic.getIPcsInOrbit(new IPcs({strPcs: '0,4,7,10'}))

    expect(inOrbitMaj7.orbit.metaStabilizer).toBeTruthy()
    expect(notInOrbitMaj7.orbit.metaStabilizer.name).not.toBeTruthy()
  })

  it("isLimitedTransposition", () => {
    const noLT = new IPcs({strPcs: '[0,4,7]'})
    expect(noLT.isLimitedTransposition()).not.toBeTruthy()
    const majAUG = new IPcs({strPcs: '[0,4,8]'})
    expect(majAUG.isLimitedTransposition()).toBeTruthy()
  })

  it("setPivot by change state of instance - not immuable", () => {
    const maj = new IPcs({strPcs: '[0,4,7]'})
    expect(maj.getPivot()).toEqual(0)
    maj.setPivot(4)
    expect(maj.getPivot()).toEqual(4)
    try {
      maj.setPivot(5)
      fail("Do not accept a invalid pivot")
    } catch (e: any) {
      expect(e.message).toContain('Invalid Pivot')
    }
  })

  it("getWithDefaultPivot", () => {
    let pcs1 = new IPcs({strPcs: '[0,4,7]'})
    expect(pcs1.getPivot()).toEqual(0)
    let pcs2 = pcs1.cloneWithDefaultPivot()
    expect(pcs2.getPivot()).toEqual(0)

    pcs1 = new IPcs({strPcs: '[4,0,7]'})
    expect(pcs1.getPivot()).toEqual(4)
    pcs2 = pcs1.cloneWithDefaultPivot()
    expect(pcs2.getPivot()).toEqual(0)

    pcs1 = new IPcs({strPcs: '[5,1,8]'})
    expect(pcs1.getPivot()).toEqual(5)
    pcs2 = pcs1.cloneWithDefaultPivot()
    // expected "leftmost" (or min) pivot
    expect(pcs2.getPivot()).toEqual(1)

  })

  it("get index in vector of order pitch ", () => {
    let pcs1 = new IPcs({strPcs: '[0,4,7]'})
    expect(pcs1.getVectorIndexOfPitchOrder(2)).toEqual(4)
    expect(pcs1.getVectorIndexOfPitchOrder(3)).toEqual(7)
    expect(pcs1.getVectorIndexOfPitchOrder(1)).toEqual(0)

    pcs1 = new IPcs({strPcs: '[0,4,7]', iPivotParam: 4})
    expect(pcs1.getVectorIndexOfPitchOrder(2)).toEqual(7)
    expect(pcs1.getVectorIndexOfPitchOrder(3)).toEqual(0)
    expect(pcs1.getVectorIndexOfPitchOrder(1)).toEqual(4)

  })

  it('getAllCyclicPcsPivotVersion()', () => {
    let pcs = new IPcs({strPcs: '[0,4,7]'})
    let allPcsInCyclicGroup = pcs.getAllCyclicPcsPivotVersion()
    expect(allPcsInCyclicGroup.length).toEqual(12)
    for (let i = 0; i < allPcsInCyclicGroup.length; i++) {
      expect(allPcsInCyclicGroup[i].iPivot).toEqual(i)
    }

    pcs = new IPcs({strPcs: '[0,4,8]'})
    allPcsInCyclicGroup = pcs.getAllCyclicPcsPivotVersion()
    expect(allPcsInCyclicGroup.length).toEqual(4)
    for (let i = 0; i < allPcsInCyclicGroup.length; i++) {
      expect(allPcsInCyclicGroup[i].iPivot).toEqual(i)
    }

  })


  it('getStabilizerOperations()', () => {

    const groupMusaic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    const attachedMaj7 = groupMusaic.getIPcsInOrbit(new IPcs({strPcs: '0,4,7,10'}))

    expect(attachedMaj7.getStabilizerOperations().length).toEqual(1)

    let attachedMelodicMinor = groupMusaic.getIPcsInOrbit(new IPcs({strPcs: '0 2 3 5 7 9 11'}))
    expect(attachedMelodicMinor.getStabilizerOperations().length).toEqual(2)
    attachedMelodicMinor = attachedMelodicMinor.cloneWithNewPivot(0) // to be sure
    expect(attachedMelodicMinor.getStabilizerOperations()[0].toString()).toEqual("M1-T0")
    expect(attachedMelodicMinor.getStabilizerOperations()[1].toString()).toEqual("M11-T2")
  })

  it('_fromStringTobinArray', () => {
    expect(IPcs._fromStringTobinArray("0, 1, 7").vector).toEqual([1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0])
    expect(IPcs._fromStringTobinArray("0, 1, 7").vector.length).toEqual(12)
    expect(IPcs._fromStringTobinArray("0, 1, 7").defaultPivot).toEqual(0)

    expect(IPcs._fromStringTobinArray("017").vector).toEqual([1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0])

    expect(IPcs._fromStringTobinArray("04710").vector).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0])
    expect(IPcs._fromStringTobinArray("047A").vector).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0])
    expect(IPcs._fromStringTobinArray("047TE").vector).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1])

    expect(IPcs._fromStringTobinArray("017").vector.length).toEqual(12)
    expect(IPcs._fromStringTobinArray("017").defaultPivot).toEqual(0)
    expect(IPcs._fromStringTobinArray("701").defaultPivot).toEqual(7)

    expect(IPcs._fromStringTobinArray("0, 1, 3", 5).vector).toEqual([1, 1, 0, 1, 0])
    expect(IPcs._fromStringTobinArray("013", 5).vector.length).toEqual(5)
    expect(IPcs._fromStringTobinArray("107", 5).defaultPivot).toEqual(0)
    expect(IPcs._fromStringTobinArray("1 07", 5).defaultPivot).toEqual(1)
    expect(IPcs._fromStringTobinArray("10 7", 5).defaultPivot).toEqual(0)
    expect(IPcs._fromStringTobinArray("710", 5).defaultPivot).toEqual(2)

    expect(IPcs._fromStringTobinArray("1 07A B", 5).defaultPivot).toEqual(1)
    expect(IPcs._fromStringTobinArray("1 07A B", 5).vector).toEqual([1, 1, 1, 0, 0])
    expect(IPcs._fromStringTobinArray("10 T7", 5).defaultPivot).toEqual(0)
    expect(IPcs._fromStringTobinArray("10 T7", 5).vector).toEqual([1, 0, 1, 0, 0])
    expect(IPcs._fromStringTobinArray("710E", 5).defaultPivot).toEqual(2)
    expect(IPcs._fromStringTobinArray("710E", 5).vector).toEqual([1, 1, 1, 0, 0])

  })

  it('isComingFromAnOrbitTrivial', () => {
    let pcs = new IPcs({strPcs: '[0,4,7]'})
    expect(pcs.isComingFromTrivialOrbit()).toBeFalse()
    let pcInOrbit = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")?.getIPcsInOrbit(pcs)
    expect(pcInOrbit?.isComingFromTrivialOrbit()).toBeFalse()
    pcInOrbit = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")?.getIPcsInOrbit(pcs)
    expect(pcInOrbit?.isComingFromTrivialOrbit()).toBeFalse()
    pcInOrbit = ManagerGroupActionService.getGroupActionFromGroupAliasName("Trivial")?.getIPcsInOrbit(pcs)
    expect(pcInOrbit?.isComingFromTrivialOrbit()).toBeTrue() // <== true
  })

  it(' clones ', () => {
    let pcs = new IPcs({strPcs: '[0,4,7]'})
    let pcInOrbit = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")?.getIPcsInOrbit(pcs)
    expect(pcInOrbit?.isComingFromOrbit()).toBeTrue()
    expect(pcInOrbit?.cloneDetached().isComingFromOrbit()).toBeFalse()
    expect(pcs.isComingFromOrbit()).toBeFalse()
    expect(pcs.cloneDetached().isComingFromOrbit()).toBeFalse()

    try {
      pcs.cloneDetachedWithPivot(42)
      fail("Pivot 42 should not be accepted")
    } catch (e) {
    }

    pcs = new IPcs({strPcs: '[0,3,6,9]'})
    pcInOrbit = pcs.getOrMakeInstanceFromOrbitOfGroupActionOf(pcInOrbit?.orbit.groupAction!, 6)
    expect(pcInOrbit?.isComingFromOrbit()).toBeTrue()
    expect(pcInOrbit?.iPivot).toEqual(6)

    let newPcs = pcInOrbit.cloneWithNewPivot(3)
    expect(newPcs.iPivot).toEqual(3)
    expect(newPcs.isComingFromOrbit()).toBeTrue()
    expect(newPcs.cloneDetachedWithPivot(0).isComingFromOrbit()).toBeFalse()

    expect(newPcs.cloneWithDefaultPivot().isComingFromOrbit()).toBeTrue()
    expect(newPcs.cloneWithDefaultPivot().iPivot).toEqual(0)

    expect(pcInOrbit.cloneWithNewPivot(0).iPivot).toEqual(0)
    expect(pcInOrbit.cloneWithNewPivot(0).isComingFromOrbit()).toBeTrue()

  })

  it(' clones with parameters ', () => {
    let pcs = new IPcs({strPcs: '[0,4,6]', n: 7})
    let pcInOrbitCyclic = ManagerGroupActionService.getGroupActionFromGroupName("n:7 [M1]")?.getIPcsInOrbit(pcs)

    expect(pcInOrbitCyclic).toBeDefined()

    expect(pcs.n).toEqual(7)
    expect(pcs.nMapping).toEqual(7) // self mapping

    let clone = pcs.cloneWithData({pivot: 0, nMapping: 12, templateMapping: [0, 2, 4, 5, 7, 9, 11]})

    expect(clone.id).toEqual(pcs.id)
    expect(clone.n).toEqual(pcs.n)
    expect(clone.nMapping).toEqual(12)
    expect(clone.templateMapping).toEqual([0, 2, 4, 5, 7, 9, 11])

    expect(pcInOrbitCyclic!.isComingFromOrbit()).toBeTrue()

    clone = pcInOrbitCyclic!.cloneWithData({orbit: new Orbit()})
    expect(clone.isComingFromTrivialOrbit()).toBeFalse()

  });

  it('IPcs.vector2indexPcNames', () => {
    /**
     * In arg to reduce. Input array of 0|1, output array of integer [0..n-1]
     * [1,0,0,0,1,0,0,1,0,0,0,0] => [0,4,7]
     */
    let vector = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0]
    let array = vector.reduce(IPcs.vector2indexPcNames, [])
    expect(array).toEqual([0, 4, 7])

    // empty pcs has no index pc name
    vector = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    array = vector.reduce(IPcs.vector2indexPcNames, [])
    expect(array).toEqual([])
  })

  it(' modalPrimeForm()', () => {
    // C Maj
    let pcs = new IPcs({strPcs: '[0,4,7]'})
    expect(pcs.modalPrimeForm().id).toEqual(pcs.id)

    let id = pcs.id
    pcs = new IPcs({strPcs: '[1,5,8]'})
    expect(pcs.modalPrimeForm().id).toEqual(id)

    pcs = new IPcs({strPcs: '[]'})
    expect(pcs.modalPrimeForm().id).toEqual(pcs.id)

    // Ab Maj
    // with pivot to 8
    pcs = new IPcs({strPcs: '[8,0,3]'})
    expect(pcs.iPivot).toEqual(8)
    // pivot not matters for id (C Maj id Major Modal Prime Form)
    expect(pcs.id).toEqual(new IPcs({strPcs: '[0,3,8]'}).id)

    const pcsMaj = new IPcs({strPcs: '[0,4,7]'})
    expect(pcs.modalPrimeForm().id).toEqual(pcsMaj.id)
    // waiting pivot to zero
    expect(pcs.modalPrimeForm().iPivot).toEqual(0)

  })


})
