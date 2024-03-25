import {IPcs} from './IPcs'
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";

describe('IPcs unit tests', () => {

  it("IPcs constructor with no iPivot = 0", () => {
    const ipcs = new IPcs({strPcs: "0,4,7"});
    expect(ipcs.iPivot).toEqual(0);
  });

  it("IPcs constructor with no iPivot > 0", () => {
    const ipcs = new IPcs({strPcs: "3,4,7"})
    expect(ipcs.iPivot).toEqual(3);
  });

  it("IPcs bad constructor with bad n ", () => {
    try {
      const ipcsDiatMajMapped = new IPcs({
        strPcs: "[0, 2, 7]",  // 7 not in [0..7[
        n: 7,
        nMapping: 12,
        templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]
      })
      expect(ipcsDiatMajMapped).not.toBeTruthy()
      expect(ipcsDiatMajMapped.n).not.toEqual(8)
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
    expect(ipcsCMajor.getMappedBinPcs()).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0])
  });

  it("IPcs constructor with strPcs:'[0, 4, 7]' ", () => {
    const ipcsCMajor: IPcs = new IPcs({
      strPcs: "[0, 4, 7]"
    })
    expect(ipcsCMajor).toBeTruthy()
    expect(ipcsCMajor.n).toEqual(12)
    expect(ipcsCMajor.getMappedBinPcs()).toEqual([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0])
  });

  it("IPcs bad detached constructor", () => {
    try {
      const ipcs: IPcs = new IPcs(
        {}
      )
      expect(ipcs).not.toBeTruthy()
    } catch (e: any) {
      expect(e.message).toContain('bad args')
    }
    // really detached args
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
      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // mapped into [0,4,7] {C E G}
    })
    expect(ipcsDiatMajMapped.getPcsStr()).toEqual('[0,2,4]')
    expect(ipcsDiatMajMapped.unMap().getPcsStr()).toEqual('[0,4,7]')
  })

  it("toString", () => {
    const pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // mapped into [0,4,7] {C E G}
    })
    expect(pcsDiatMajMapped.toString()).toEqual('[1,0,1,0,1,0,0] n = 7, iPivot : 0  Mapped on 12')

    const pcsDefaultMapping = new IPcs({
      strPcs: "[0, 4, 7]"
    })
    expect(pcsDefaultMapping.toString()).toEqual('[1,0,0,0,1,0,0,1,0,0,0,0] n = 12, iPivot : 0')
  })

  it("IPcs cardinal", () => {
    const ipcs = new IPcs({strPcs: "0,4,7", iPivot: 0})
    expect(ipcs.cardinal).toEqual(3);
  });

  it("IPcs translation + 1", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_plus_one = new IPcs({strPcs: "1,5,0", iPivot: 1})

    expect(ipcs.translation(1)).toEqual(ipcs_plus_one);
  });

  it("IPcs translation - 1", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_minus_one = new IPcs({strPcs: "11,3,10", iPivot: 11})

    expect(ipcs.translation(-1)).toEqual(ipcs_minus_one);
  });

  it("IPcs translation - 12", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "0,11,4", iPivot: 0})

    expect(ipcs.translation(-12)).toEqual(ipcs_other);
  });

  it("IPcs translation + 12+6", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "6,10,5", iPivot: 6})

    expect(ipcs.translation(18)).toEqual(ipcs_other);
  });

  it("IPcs modulation NEXT ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    let ipcs_other1
    let ipcs_other2 = new IPcs({strPcs: "0,4,11", iPivot: 4})

    expect(ipcs.modulation(IPcs.NEXT_DEGREE)).toEqual(ipcs_other2);
    ipcs_other1 = new IPcs({strPcs: "0,4,11", iPivot: 11})
    expect(ipcs_other2.modulation(IPcs.NEXT_DEGREE)).toEqual(ipcs_other1);
    ipcs_other2 = new IPcs({strPcs: "0,4,11", iPivot: 0})
    expect(ipcs_other1.modulation(IPcs.NEXT_DEGREE)).toEqual(ipcs_other2);
  });

  it("IPcs cardinal PREVIOUS", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "0,4,11", iPivot: 11})

    expect(ipcs.modulation(IPcs.PREV_DEGREE)).toEqual(ipcs_other);
  });

  it("IPcs equals ok ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "11,4,0", iPivot: 0})

    expect(ipcs.equals(ipcs_other)).toBeTruthy();
  });

  it("IPcs equals with not same pivot ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "0,4,11", iPivot: 11})

    expect(ipcs.equals(ipcs_other)).toBeTruthy();
    expect(ipcs.equalsPcs(ipcs_other)).toBeTruthy();
  });

  it("IPcs complement ", () => {
    const ipcs = new IPcs({strPcs: "0,2,4,5,7,9,11", iPivot: 0})
    const ipcs_complement = new IPcs({strPcs: "1,3,6,8,10", iPivot: 6})
    const complement = ipcs.complement()

    const cpltcplt = complement.complement()

    expect(complement.equals(ipcs_complement)).toBeTruthy();
    expect(cpltcplt.equals(ipcs)).toBeTruthy();
  });

  it("IPcs complement max/detached", () => {
    const ipcs12pc = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivot: 0})
    try {
      expect(ipcs12pc.cardinal).toEqual(12)
      const complement = ipcs12pc.complement()
      expect(complement.cardinal).toEqual(0)
    } catch (e: any) {
      expect(e.toString()).toMatch("Not accept detached pcs ?")
    }
  });

  it("IPcs cardOrbitMode", () => {
    let ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "1, 4, 7, 10", iPivot: 1})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 4, 8", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 1, 6, 7", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(2)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 1, 2, 3", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(4)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))

    ipcs = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(7)
    expect(ipcs.cardOrbitMode()).toEqual(ipcs.cardinal / (ipcs.n / ipcs.cyclicPrimeForm().orbit.cardinal))


    ipcs = new IPcs({strPcs: "0", n: 12})
    expect(ipcs.cardOrbitMode()).toEqual(1)

    ipcs = new IPcs({strPcs: "", n: 12})
    expect(ipcs.cardOrbitMode()).toEqual(0)
  });

  it("IPcs cardOrbitCyclic", () => {
    let ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    expect(ipcs.cardOrbitCyclic()).toEqual(3)
    ipcs = ipcs.cyclicPrimeForm()
    // pcs is now attached with good orbit (for good average test)
    expect(ipcs.cardOrbitCyclic()).toEqual(3)

    ipcs = new IPcs({strPcs: "0, 4, 8", iPivot: 0})
    expect(ipcs.cardOrbitCyclic()).toEqual(4);
    ipcs = new IPcs({strPcs: "0, 1, 6, 7", iPivot: 0})
    expect(ipcs.cardOrbitCyclic()).toEqual(6);
    ipcs = new IPcs({strPcs: "0, 1, 2, 3", iPivot: 0})
    expect(ipcs.cardOrbitCyclic()).toEqual(12);
    ipcs = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivot: 0})
    expect(ipcs.cardOrbitCyclic()).toEqual(12);
    ipcs = new IPcs({strPcs: "0, 1, 3, 5, 6, 8, 10", iPivot: 0})
    expect(ipcs.cardOrbitCyclic()).toEqual(12);


    let cyclicGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.CYCLIC]})
    ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})

    let orbit = cyclicGroup12.getOrbitOf(ipcs)
    expect(orbit.cardinal).toEqual(3)

  });

  it("IPcs cyclicPrimeForm", () => {
    let ipcsPF = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    expect(ipcsPF.cyclicPrimeForm().getMappedBinPcs()).toEqual(ipcsPF.getMappedBinPcs())
    let ipcs = new IPcs({strPcs: "1, 4, 7, 10", iPivot: 1})
    expect(ipcs.cyclicPrimeForm().getMappedBinPcs()).toEqual(ipcsPF.getMappedBinPcs())
    ipcs = new IPcs({strPcs: "7", iPivot: 7})
    let pcsExpected = new IPcs({strPcs: "0", iPivot: 0})
    expect(ipcs.cyclicPrimeForm().getMappedBinPcs()).toEqual(pcsExpected.getMappedBinPcs())
    ipcs = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivot: 7})
    pcsExpected = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivot: 0})
    expect(ipcs.cyclicPrimeForm().getMappedBinPcs()).toEqual(pcsExpected.getMappedBinPcs())
  });

  it("IPcs cyclicPrimeForm from pcs with orbit set", () => {
    let ipcsNotPF = new IPcs({strPcs: "1, 4, 7, 10"})
    expect(ipcsNotPF.isDetached()).toBeTruthy()
    const groupAction: GroupAction = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    let ipcsFromGroupActionNotPF: IPcs = groupAction.getIPcsInOrbit(ipcsNotPF)
    expect(ipcsFromGroupActionNotPF.isDetached()).not.toBeTruthy()
    let ipcsPF = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    expect(ipcsFromGroupActionNotPF.cyclicPrimeForm()).toEqual(groupAction.getIPcsInOrbit(ipcsPF))
  })

  it("IPcs dihedralPrimeForm example Maj -> Min", () => {
    const cMaj = new IPcs({strPcs: "0, 4, 7"})
    const cMajDihedral = cMaj.affineOp(11, 0)
    expect(cMaj.getMappedBinPcs()).toEqual(cMajDihedral.affineOp(11, 0).getMappedBinPcs())
    const cMajDihedralPF = new IPcs({strPcs: "0, 3, 7"})
    expect(cMaj.dihedralPrimeForm().getMappedBinPcs()).toEqual(cMajDihedralPF.getMappedBinPcs())

    // test when pcs have already good orbit
    const ipcs2 = cMaj.dihedralPrimeForm()
    expect(ipcs2.getMappedBinPcs()).toEqual(ipcs2.translation(2).dihedralPrimeForm().getMappedBinPcs())
  })

  it("IPcs affinePrimeForm", () => {
    const cMaj = new IPcs({strPcs: "0, 4, 7"})
    const cMajDihedral = cMaj.affineOp(11, 0)
    let ipcs = cMajDihedral.affineOp(5, 0)
    expect(ipcs.getMappedBinPcs()).toEqual([1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0])
    expect(ipcs.getMappedBinPcs()).toEqual(cMaj.affinePrimeForm().getMappedBinPcs())

    // test when pcs have already good orbit
    const ipcs2 = cMaj.affinePrimeForm()
    expect(ipcs2.getMappedBinPcs()).toEqual(ipcs2.translation(2).affinePrimeForm().getMappedBinPcs())
  })


  it("IPcs musaicPrimeForm", () => {
    const ipcsWithNoOrbit = new IPcs({strPcs: "0, 3, 5, 8", iPivot: 0})
    expect(ipcsWithNoOrbit.isDetached()).toBeTruthy()

    // page 1171 de ToposOfMusic
    const ipcsMusaicPF = new IPcs({strPcs: "0, 1, 3, 4", iPivot: 0})
    const primeForm = ipcsWithNoOrbit.musaicPrimeForm()
    expect(primeForm.id).toEqual(ipcsMusaicPF.id)

    expect(primeForm.isDetached()).not.toBeTruthy()
    const ipcsWithOrbit = primeForm.translation(1)
    expect(ipcsWithOrbit.isDetached()).not.toBeTruthy()
    expect(primeForm).toEqual(ipcsWithOrbit.musaicPrimeForm())
  });


  it("IPcs Set by Map then sort and convert to Array", () => {
    let ipcs1 = new IPcs({strPcs: "1, 4, 6, 9", iPivot: 1})
    let ipcs2 = new IPcs({strPcs: "0, 3, 5, 8", iPivot: 0})
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
    let ipcs1 = new IPcs({strPcs: "1, 4, 6, 9", iPivot: 1})
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

  it("IPcs modal prime form", () => {
    let ipcs1 = new IPcs({strPcs: ""})
    let ipcs2 = new IPcs({strPcs: "0"})
    let ipcs3 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivot: 4})
    let ipcs4 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivot: 0})
    expect(ipcs3.modalPrimeForm()).toEqual(ipcs4)
    expect(ipcs2.modalPrimeForm()).toEqual(ipcs2)
    expect(ipcs1.modalPrimeForm()).toEqual(ipcs1)
    let majBass3 = new IPcs({strPcs: "0, 4, 7", iPivot: 4})
    let minB6 = new IPcs({strPcs: "0, 3, 8", iPivot: 0})

    expect(majBass3.modalPrimeForm()).toEqual(minB6)
    let minBass3 = new IPcs({strPcs: "0, 3, 7", iPivot: 3})
    let maj6 = new IPcs({strPcs: "0, 4, 9", iPivot: 0})
    expect(minBass3.modalPrimeForm()).toEqual(maj6)
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
    symMedian = [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    symInter = [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

    // detached set => full symmetries
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

  it("IPcs symmetry n=7", () => {
    // n = 7
    let ipcs = new IPcs({binPcs: [1, 0, 1, 0, 1, 0, 1]})
    let symmetries = ipcs.getAxialSymmetries()
    let symMedian = [0, 0, 0, 1, 0, 0, 0]
    let symInter = [0, 0, 0, 0, 0, 0, 0]
    expect(symmetries.symMedian).toEqual(symMedian)
    expect(symmetries.symInter).toEqual(symInter)

    // detached set => full symmetries
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
  it("IPcs is function n=12", () => {
    let ipcs = new IPcs({
      binPcs: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0]
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

    ipcs = new IPcs({strPcs: "1,5,8", iPivot: 1}) // 1 ==> iPivot default value here
    expect(ipcs.is()).toEqual([4, 3, 5])

    ipcs = new IPcs({strPcs: "1,5,8", iPivot: 5})
    expect(ipcs.is()).toEqual([3, 5, 4])
  })

  it("toggleIndexPC", () => {
    let ipcsDim = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    let ipcsNew = ipcsDim.toggleIndexPC(0)
    expect(ipcsNew.n).toEqual(12)
    expect(ipcsDim.cardinal).toEqual(4)
    expect(ipcsNew.cardinal).toEqual(3)
    expect(ipcsNew.iPivot).toEqual(3)
    let ipcsNew2 = ipcsNew.toggleIndexPC(0)
    expect(ipcsNew2.abinPcs).toEqual(ipcsDim.abinPcs)
    // no go back for iPivot...
    expect(ipcsNew2.iPivot).toEqual(3)
  })

  it("toggleIndexPC solo => detached", () => {
    let ipcsOnePitch = new IPcs({strPcs: "6", n: 12, iPivot: 6})
    let emptyPcs = new IPcs({strPcs: "", n: 12})
    let ipcsNew = ipcsOnePitch.toggleIndexPC(6)
    expect(ipcsNew).toEqual(emptyPcs)
  })

  it("toggleIndexPC bad index", () => {
    let ipcsOnePitch = new IPcs({strPcs: "6", n: 12, iPivot: 6})
    try {
      ipcsOnePitch.toggleIndexPC(12)
      fail('ipcsNew must not be instantiated')
      //same : expect(ipcsNew).not.toBeTruthy()
    } catch (e) {
      expect().nothing()
    }
  })

  it("get complement() with, or not, this orbit", () => {
    let cyclicGroup12 = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)

    let ipcsWithoutOrbit = new IPcs({strPcs: "0, 4, 8", iPivot: 0})
    let ipcsWithOrbit: IPcs = cyclicGroup12.getIPcsInOrbit(ipcsWithoutOrbit)

    expect(ipcsWithoutOrbit.isDetached()).toBeTruthy()
    expect(ipcsWithOrbit.isDetached()).not.toBeTruthy()

    expect(ipcsWithoutOrbit.complement().isDetached()).toBeTruthy()
    expect(ipcsWithOrbit.complement().isDetached()).not.toBeTruthy()
  })

  it("get new Pivot", () => {
    let ipcsMaj = new IPcs({strPcs: "0, 4, 7", iPivot: 0})
    let ipcsMajPivotThird = new IPcs({strPcs: "0, 4, 7", iPivot: 4})
    expect(ipcsMaj.getWithNewPivot(4)).toEqual(ipcsMajPivotThird)
  })


  it("get new bad Pivot", () => {
    let ipcsMaj = new IPcs({strPcs: "0, 4, 7", iPivot: 0})
    let ipcsMajPivotThird = new IPcs({strPcs: "0, 4, 7", iPivot: 4})
    try {
      expect(ipcsMaj.getWithNewPivot(6)).toEqual(ipcsMajPivotThird)
      fail("Error waiting, because bad new pivot")
    } catch (e: any) {
      // good
      expect().nothing()
    }
  })

  it("equals with same pivot", () => {
    let ipcsMajPivot0 = new IPcs({strPcs: "0, 4, 7", iPivot: 0})
    let ipcsMajBisPivot0 = new IPcs({strPcs: "0, 4, 7", iPivot: 0})
    expect(ipcsMajPivot0.equals(ipcsMajBisPivot0)).toBeTruthy()
  })

  it("equals with NOT same pivot", () => {
    let ipcsMajPivot0 = new IPcs({strPcs: "0, 4, 7", iPivot: 0})
    let ipcsMajBisPivot4 = new IPcs({strPcs: "0, 4, 7", iPivot: 4})
    expect(ipcsMajPivot0.equals(ipcsMajBisPivot4)).toBeTruthy()
  })


  it("getMappedBinPcs no mapping", () => {
    let dminor7 = new IPcs({strPcs: "0,2,5,9", iPivot: 2})
    expect(dminor7.getMappedBinPcs()).toEqual([1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0])
  })


  it("autoMAp getMappedBinPcs 7 diat maj => 12 chromatic", () => {
    let ipcsDiatMaj = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivot: 0})
    expect(ipcsDiatMaj.n).toEqual(12)

    let ipcsDiatMajMappedIn12 = ipcsDiatMaj.autoMap()
    expect(ipcsDiatMajMappedIn12.n).toEqual(7)
    expect(ipcsDiatMajMappedIn12.nMapping).toEqual(12)
    expect(ipcsDiatMajMappedIn12.getMappedBinPcs().length).toEqual(12)

    // unselect 3 pitches
    let otherPics = ipcsDiatMajMappedIn12.toggleIndexPC(1)
    expect(otherPics.id).toEqual(new IPcs({strPcs: '[0, 2, 3, 4, 5, 6]', n: 7}).id)
    otherPics = otherPics.toggleIndexPC(3)
    otherPics = otherPics.toggleIndexPC(5)
    expect(otherPics.id).toEqual(new IPcs({strPcs: '[0, 2, 4, 6]', n: 7}).id)

    // verify state
    expect(otherPics.getMappedBinPcs().length).toEqual(12)
    expect(otherPics.n).toEqual(7)
    expect(otherPics.cardinal).toEqual(4)
    expect(otherPics.abinPcs).toEqual([1, 0, 1, 0, 1, 0, 1])

    // verify that getMappedBinPcs of mapped pcs (n=7) is equals to getMappedBinPcs of none mapped pcs (n=12)
    let binPcs = new IPcs(
      {strPcs: '[0, 4, 7, 11]', n: 12}).getMappedBinPcs()
    expect(otherPics.getMappedBinPcs()).toEqual(binPcs)
  })


  it("autoMap 7 diat maj => 12 - verify transposition", () => {
    let ipcsDiatMaj = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivot: 0})
    let ipcsDiatMajMappedIn12 = ipcsDiatMaj.autoMap()

    let otherPics = ipcsDiatMajMappedIn12.toggleIndexPC(1)
    otherPics = otherPics.toggleIndexPC(3)
    otherPics = otherPics.toggleIndexPC(5)
    let firstDegree = otherPics.toggleIndexPC(6)

    expect(firstDegree.abinPcs).toEqual([1, 0, 1, 0, 1, 0, 0])

    // verify mapping ok ?
    expect(firstDegree.getMappedBinPcs())
      .toEqual(new IPcs({strPcs: '[0, 4, 7]', n: 12}).getMappedBinPcs())

    // now verify if transposition in 7 has a good impact in 12 mapped
    let secondeDegreeIn7 = firstDegree.translation(1) // C,E,G => D,F,A
    expect(firstDegree.abinPcs).toEqual([1, 0, 1, 0, 1, 0, 0])
    expect(secondeDegreeIn7.abinPcs).toEqual([0, 1, 0, 1, 0, 1, 0])

    let expectedDminorIn12 = new IPcs({strPcs: "2,5,9", n: 12}) // D, F, A
    expect(secondeDegreeIn7.getMappedBinPcs()).toEqual(expectedDminorIn12.getMappedBinPcs())

    // good ! a little self-satisfaction can't hurt...

  })

  it("unMap 7 diat maj => 12", () => {
    const ipcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // mapped in {C E G}
    })

    // verify mapping 7 -> 12
    expect(ipcsDiatMajMapped.n).toEqual(7)
    expect(ipcsDiatMajMapped.nMapping).toEqual(12)

    // now get unMap, as 12 -> 12
    const ipcsDiatMaj = ipcsDiatMajMapped.unMap()
    expect(ipcsDiatMaj.n).toEqual(12)

    // default mapping is n
    expect(ipcsDiatMaj.nMapping).toEqual(12)
    expect(ipcsDiatMaj.templateMappingBinPcs.length).toEqual(12)

    expect(ipcsDiatMaj.getMappedBinPcs().length).toEqual(12)
  })

  it("Default Mapping", () => {
    const ipcsDminor = new IPcs({
      strPcs: "[2, 5, 9]", // D minor
      n: 12,
    })
    expect(ipcsDminor.nMapping).toEqual(ipcsDminor.n)
    expect(ipcsDminor.nMapping).toEqual(12)
    expect(ipcsDminor.templateMappingBinPcs).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })


  it("unMap a pcs not mapped", () => {
    const ipcsDminor = new IPcs({
      strPcs: "[2, 5, 9]", // D minor
      n: 12,
    })
    expect(ipcsDminor.unMap()).toEqual(ipcsDminor)
  })


  it("getMappedPcsStr", () => {
    const ipcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // mapped into [0,4,7] {C E G}
    })
    expect(ipcsDiatMajMapped.getPcsStr()).toEqual('[0,2,4]')
    expect(ipcsDiatMajMapped.getMappedPcsStr()).toEqual('[0,4,7]')

    expect(ipcsDiatMajMapped.unMap().getPcsStr()).toEqual('[0,4,7]')
    // default auto-map on himself
    expect(ipcsDiatMajMapped.unMap().getMappedPcsStr()).toEqual('[0,4,7]')

  })

  it('indexMappedToIndexInner', () => {
    const pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7] {C E G}
    })
    expect(pcsDiatMajMapped.indexMappedToIndexInner(0)).toEqual(0)
    expect(pcsDiatMajMapped.indexMappedToIndexInner(2)).toEqual(1)
    expect(pcsDiatMajMapped.indexMappedToIndexInner(11)).toEqual(6)

    // test with index out of mapping
    expect(pcsDiatMajMapped.indexMappedToIndexInner(1)).toEqual(-1)
    expect(pcsDiatMajMapped.indexMappedToIndexInner(6)).toEqual(-1)
  })


  it("Forte detached set", () => {
    const ipcsEmpty = new IPcs({strPcs: '[]', n: 12})
    expect(ipcsEmpty.forteNum()).toEqual('0-1');
  });

  it("Forte [0,6]", () => {
    const ipcsEmpty = new IPcs({strPcs: '[0,6]', n: 12})
    expect(ipcsEmpty.forteNum()).toEqual('2-6');
  });

  it("Forte [0,1,2,3,6]", () => {
    const ipcsEmpty = new IPcs({strPcs: '[0,1,2,3,6]', n: 12})
    // 5-4 or 5-4A
    expect(ipcsEmpty.forteNum()).toContain('5-4');
  });

  it("Forte bad pcs", () => {
    const ipcsEmpty = new IPcs({strPcs: '[0,1,2,3,6]', n: 7})
    // n != 12
    expect(ipcsEmpty.forteNum()).toEqual('');
  });


  it("Forte inversions are marked 8-4B", () => {
    let ipcs = new IPcs({strPcs: '[0,1,3,4,5,6,7,8]'})
    // pass by pcs.dihedralPrimeForm().pcsStr
    expect(ipcs.forteNum()).toEqual('8-4');
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
      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7]
    })
    expect(pcsDiatMajMapped.getMappedPcsStr()).toEqual('[0,4,7]')
    expect(pcsDiatMajMapped.is()).toEqual([4, 3, 5]);

    // Sum of elements of IS is n
    expect(pcsDiatMajMapped.is().reduce((sum, e) => e + sum)).toEqual(pcsDiatMajMapped.nMapping)
  });


  it("isDetached", () => {
    const ipcsMaj3Pitches: IPcs = new IPcs({
      strPcs: "[0, 4, 7]", // C Major
    })
    expect(ipcsMaj3Pitches.isDetached()).toBe(true)

    const ipcsPrimeForme = ipcsMaj3Pitches.cyclicPrimeForm()
    expect(ipcsPrimeForme.isDetached()).toBe(false)
    // because ipcsPrimeForme is get from group action
  });


  it("get stabilizer", () => {
    const detachedMaj7 =
      new IPcs({strPcs: '0,4,7,10'})
    const groupMusaic = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)

    const attachedMaj7 = groupMusaic.getIPcsInOrbit(new IPcs({strPcs: '0,4,7,10'}))

    try {
      expect(attachedMaj7.stabilizer).toBeTruthy()

      expect(detachedMaj7.stabilizer).not.toBeTruthy()
      fail('A detached PCS must not have Stabilizer !?!')
    } catch (e: any) {
      expect(e.message).toContain('A detached PCS has no Stabilizer')
    }
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
    }catch (e:any) {
      expect(e.message).toContain('Invalid Pivot')
    }
  })


})
