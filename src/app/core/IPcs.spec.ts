import {IPcs} from './IPcs'

describe('IPcs', () => {

  it("IPcs constructor with no iPivot = 0", () => {
    const ipcs = new IPcs({strPcs: "0,4,7"});
    expect(ipcs.iPivot).toEqual(0);
  });

  it("IPcs constructor with no iPivot > 0", () => {
    const ipcs = new IPcs({strPcs: "3,4,7"})
    expect(ipcs.iPivot).toEqual(3);
  });

  it("IPcs cardinal", () => {
    const ipcs = new IPcs({strPcs: "0,4,7", iPivot: 0})
    expect(ipcs.cardinal()).toEqual(3);
  });

  it("IPcs transpose + 1", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_plus_one = new IPcs({strPcs: "1,5,0", iPivot: 1})

    expect(ipcs.transpose(1)).toEqual(ipcs_plus_one);
  });

  it("IPcs transpose - 1", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_minus_one = new IPcs({strPcs: "11,3,10", iPivot: 11})

    expect(ipcs.transpose(-1)).toEqual(ipcs_minus_one);
  });

  it("IPcs transpose - 12", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "0,11,4", iPivot: 0})

    expect(ipcs.transpose(-12)).toEqual(ipcs_other);
  });

  it("IPcs transpose + 12+6", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "6,10,5", iPivot: 6})

    expect(ipcs.transpose(18)).toEqual(ipcs_other);
  });

  it("IPcs modulate NEXT ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    let ipcs_other1
    let ipcs_other2 = new IPcs({strPcs: "0,4,11", iPivot: 4})

    expect(ipcs.modulate(IPcs.NEXT_MODULATION)).toEqual(ipcs_other2);
    ipcs_other1 = new IPcs({strPcs: "0,4,11", iPivot: 11})
    expect(ipcs_other2.modulate(IPcs.NEXT_MODULATION)).toEqual(ipcs_other1);
    ipcs_other2 = new IPcs({strPcs: "0,4,11", iPivot: 0})
    expect(ipcs_other1.modulate(IPcs.NEXT_MODULATION)).toEqual(ipcs_other2);
  });

  it("IPcs cardinal PREVIOUS", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "0,4,11", iPivot: 11})

    expect(ipcs.modulate(IPcs.PREV_MODULATION)).toEqual(ipcs_other);
  });

  it("IPcs equals ok ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "11,4,0", iPivot: 0})

    expect(ipcs.equals(ipcs_other)).toBeTruthy();
  });

  it("IPcs equals ko ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "0,4,11", iPivot: 11})

    expect(ipcs.equals(ipcs_other)).not.toBeTruthy();
  });

  it("IPcs equalsPcs ", () => {
    const ipcs = new IPcs({strPcs: "0,4,11", iPivot: 0})
    const ipcs_other = new IPcs({strPcs: "0,4,11", iPivot: 4})

    // not equals because iPivot are not same
    expect(ipcs.equals(ipcs_other)).not.toBeTruthy();
    // ok
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

  it("IPcs complement max/empty", () => {
    const ipcs12pc = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivot: 0})
    try {
      console.log("before complement")
      expect(ipcs12pc.cardinal()).toEqual(12)
      const complement = ipcs12pc.complement()
      console.log("cpt : = " + complement)
      expect(complement.cardinal()).toEqual(0)
    } catch (e: any) {
      expect(e.toString()).toMatch("Not accept empty pcs ?")
    }
  });

  it("IPcs cardOrbitMode", () => {
    let ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    ipcs = new IPcs({strPcs: "1, 4, 7, 10", iPivot: 1})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    ipcs = new IPcs({strPcs: "0, 4, 8", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(1)
    ipcs = new IPcs({strPcs: "0, 1, 6, 7", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(2)
    ipcs = new IPcs({strPcs: "0, 1, 2, 3", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(4)
    ipcs = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivot: 0})
    expect(ipcs.cardOrbitMode()).toEqual(7)
  });

  it("IPcs cardOrbitCyclic", () => {
    let ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
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
  });

  it("IPcs cyclicPrimeForm", () => {
    let ipcsPF = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    expect(ipcsPF.cyclicPrimeForm().equals(ipcsPF)).toBeTruthy();
    let ipcs = new IPcs({strPcs: "1, 4, 7, 10", iPivot: 1})
    expect(ipcs.cyclicPrimeForm().equals(ipcsPF)).toBeTruthy();
    ipcs = new IPcs({strPcs: "7", iPivot: 7})
    let pcsExpected = new IPcs({strPcs: "0", iPivot: 0})
    expect(ipcs.cyclicPrimeForm().equals(pcsExpected)).toBeTruthy();
    ipcs = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivot: 7})
    pcsExpected = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11", iPivot: 0})
    expect(ipcs.cyclicPrimeForm().equals(pcsExpected)).toBeTruthy();
  });

  it("IPcs musaicPrimeForm", () => {
    let ipcs = new IPcs({strPcs: "0, 3, 5, 8", iPivot: 0})
    // page 1171 de ToposOfMusic
    let ipcsMusaicPF = new IPcs({strPcs: "0, 1, 3, 4", iPivot: 0})
    expect(ipcs.musaicPrimeForm()).toEqual(ipcsMusaicPF)
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

  it("IPcs symmetry n=7", () => {
    // n = 7
    let ipcs = new IPcs({binPcs: [1, 0, 1, 0, 1, 0, 1]})
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
  it("IPcs is function n=12", () => {
    // n = 7
    let ipcs = new IPcs({binPcs: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0]})
    expect(ipcs.is).toEqual([3, 4, 5])
    ipcs = new IPcs({strPcs: "0,2"})
    expect(ipcs.is).toEqual([2, 10])
    ipcs = new IPcs({strPcs: "4"})
    expect(ipcs.is).toEqual([0])
    ipcs = new IPcs({strPcs: ""})
    expect(ipcs.is).toEqual([])
    ipcs = new IPcs({strPcs: "0,1,2,3,4,5,6,7,8,9,10,11"})
    expect(ipcs.is).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])

    ipcs = new IPcs({strPcs: "1,5,8", iPivot: 1}) // 1 ==> iPivot default value here
    expect(ipcs.is).toEqual([4, 3, 5])

    ipcs = new IPcs({strPcs: "1,5,8", iPivot: 5})
    expect(ipcs.is).toEqual([3, 5, 4])
  })

})
