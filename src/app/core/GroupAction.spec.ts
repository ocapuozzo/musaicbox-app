/*
 * Copyright (c) 2019. Olivier Capuozzo
 */

import {GroupAction} from "./GroupAction"
import {IPcs} from "./IPcs";
import {MusaicPcsOperation} from "./MusaicPcsOperation";
import {Group} from "./Group";

describe('GroupAction', () => {

  it("Default constructor ", () => {
    let trivialGroupAction = new GroupAction()
    expect(trivialGroupAction.powerset.size).toEqual(Math.pow(2, 12))
    expect(trivialGroupAction.n).toEqual(12)
    expect(trivialGroupAction.orbits.length).toEqual(Math.pow(2, 12))
    expect(trivialGroupAction.operations.length).toEqual(1)
  });


  it("All subsets of n = 5 ", () => {
    let powerset5 = Array.from(GroupAction.buildPowerSetOfIPcs(5).values());
    expect(powerset5.length).toEqual(Math.pow(2, 5))
    let minPcs = new IPcs({strPcs: "", n: 5})
    let maxPcs = new IPcs({strPcs: "0,1,2,3,4", n: 5})
    expect(minPcs.equalsPcs(powerset5[0])).toBeTruthy()
    expect(maxPcs.equalsPcs(powerset5[31])).toBeTruthy()
  });

  it("Powerset n = 12", () => {
    let musaicGroup12 = GroupAction.buildPowerSetOfIPcs(12);
    expect(musaicGroup12.size).toEqual(Math.pow(2, 12))
  });

  it("Action group trivial n = 12 ", () => {
    let opNeutral = new MusaicPcsOperation(12, 1, 0);
    let musaicGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral]});
    expect(musaicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(musaicGroup12.orbits.length).toEqual(Math.pow(2, 12))
    // only one stabilizer
    expect(musaicGroup12.orbitsSortedByStabilizers.length).toEqual(1)
  });

  it("Action group cyclic n = 12 ", () => {
    let opNeutral = new MusaicPcsOperation(12, 1, 0);
    let opM1T1 = new MusaicPcsOperation(12, 1, 1);
    let cyclicGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opM1T1]});

    expect(cyclicGroup12.operations.length).toEqual(12)
    expect(cyclicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(cyclicGroup12.orbits.length).toEqual(352)

    // console.log("first stab : " + cyclicGroup12.orbitsSortedByStabilizers[0].groupingCriterion)
    expect(cyclicGroup12.orbitsSortedByStabilizers.length).toEqual(6)

    let nbPcs = 0
    let nbEATL = 0
    let orbitByStabShortName = new Set()
    cyclicGroup12.orbits.forEach(
      orbit => {
        orbitByStabShortName.add(orbit.name)
        orbit.stabilizers.forEach((stab => {
          nbPcs += stab.fixedPcs.length
          // skip trivial stab
          if (stab.operations.length > 1) {
            let primeFormes = new Map()
            stab.fixedPcs.forEach(pcs => {
              primeFormes.set(pcs.cyclicPrimeForm().id, pcs.cyclicPrimeForm())
            })
            nbEATL += primeFormes.size
          }
        }))
      })

    // 2^12 = 4096
    expect(nbPcs).toEqual(4096)
    // 17 LTs is-motifs
    expect(nbEATL).toEqual(17)

    // 5 classes of limited transposition plus identity stab ([M1-T0]), so 6 waiting
    // expected 6 stabilizer names (2/1 , 54/6 , 12/4 , 6/3 , 2/2 and 4020/12)
    // (sorted by name) M1-T0 M1-T0~1* M1-T0~2* M1-T0~3* M1-T0~4* M1-T0~6*
    expect(cyclicGroup12.orbitsSortedByStabilizers.length).toEqual(6)

    // There are 335 orbits transposable 12 times and 17 in limited transposition
    // When filter all orbits with cardinal < 335, we should get 17 orbits
    let sumLTs = cyclicGroup12.orbitsSortedByStabilizers
      .filter(sortedOrbit => sortedOrbit.orbits.length < 335)
      .reduce((sum, current) => sum + current.orbits.length, 0)
    expect(sumLTs).toEqual(17)
  });

  it("Action group dihedral n = 12 ", () => {
    let opNeutral = new MusaicPcsOperation(12, 1, 0);

    let opM1T1 = new MusaicPcsOperation(12, 1, 1);
    let opM11 = new MusaicPcsOperation(12, 11, 0);
    let musaicGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opM1T1, opM11]});
    expect(musaicGroup12.operations.length).toEqual(24)
    expect(musaicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(musaicGroup12.orbits.length).toEqual(224)
  });

  it("Action group affine n = 12 ", () => {
    let opNeutral = new MusaicPcsOperation(12, 1, 0);
    let opT1 = new MusaicPcsOperation(12, 1, 1);
    let opM5 = new MusaicPcsOperation(12, 5, 0);
    let opM7 = new MusaicPcsOperation(12, 7, 0);
    let musaicGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opT1, opM5, opM7]});
    expect(musaicGroup12.operations.length).toEqual(48)
    expect(musaicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(musaicGroup12.orbits.length).toEqual(158)
  });

  it("Action group musaic n = 5 ", () => {
    let opNeutral = new MusaicPcsOperation(5, 1, 0);
    let opCM1 = new MusaicPcsOperation(5, 1, 1, true);

    let musaicGroup5 = new GroupAction({n: 5, someMusaicOperations: [opNeutral, opCM1]});

    expect(musaicGroup5.powerset.size).toEqual(Math.pow(2, 5))
    expect(musaicGroup5.orbits.length).toEqual(4)

  });

  /**
   * TODO : (a first ?) comment to be checked in proofreading / code review !!
   * If group has a complemented operation then this group must have CM1-T1 op
   * because pcsList complemented lost his iPivot... So equivalence relation must include
   * "to a near transposition"
   */
  it("group with complemented op and no T (n = 12)", () => {
    let complemented = true
    let opNeutral = new MusaicPcsOperation(12, 1, 0);
    let opCM1 = new MusaicPcsOperation(12, 1, 0, complemented);
    let opM5 = new MusaicPcsOperation(12, 5, 0, complemented);
    let opM7 = new MusaicPcsOperation(12, 7, 0, !complemented);
    try {
      let group = new GroupAction({
        n: 12,
        someMusaicOperations: [opNeutral, /*opCM1T1, opM1, */ opCM1, opM5, opM7]
      });
      expect(group.orbits.length).toEqual(919)
    } catch (e) {
      fail(e)
    }
  })

  /**
   * TODO specs !
   */
  it("Test M5 M7 T0 group (n = 12) ", () => {
    let complemented = true
    let opNeutral = new MusaicPcsOperation(12, 1, 0);
    let opM5 = new MusaicPcsOperation(12, 5, 0, !complemented);
    let opM7 = new MusaicPcsOperation(12, 7, 0, !complemented);

    let group = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opM5, opM7]});

    if (group.orbitsSortedByMotifStabilizers === undefined) {
      throw new Error("group.orbitsSortedByMotifStabilizers undefined")
    }

    try {
      expect(group.orbits.length).toEqual(1886)
      // console.log("orbits.length : " + group.orbits.length)
      // console.log("group.operations : " + group.operations)
      // console.log("group.orbitsSortedByMotifStabilizers size: " + group.orbitsSortedByMotifStabilizers.length)

      // group.orbitsSortedByMotifStabilizers.forEach(
      //   motif => console.log(motif.groupingCriterion)
      // )

    } catch (e) {
      fail(e)
    }
  })


  it("Predefined Musaic Group Action n=12", () => {
    let musaicGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.MUSAIC]})

    expect(musaicGroup12.operations.length).toEqual(96)
    expect(musaicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(musaicGroup12.orbits.length).toEqual(88)
    expect(musaicGroup12.orbitsSortedByMotifStabilizers.length).toEqual(13)

    // TODO to demonstrate mathematically
    expect(musaicGroup12.orbitsSortedByStabilizers.length).toEqual(27)

    let lastPF = new IPcs({pidVal: 1365, n: 12}) // whole tone scale
    // test equality of PCS
    expect(musaicGroup12.orbits[musaicGroup12.orbits.length - 1].getPcsMin().equalsPcs(lastPF)).toBeTruthy()
    // whole tone scale : 2 in orbit
    expect(musaicGroup12.orbits[musaicGroup12.orbits.length - 1].ipcsset.length).toEqual(2)

    expect(musaicGroup12.cardinalOfOrbitStabilized()).toEqual(88)
  })


  it("Predefined Cyclic Group Action n=12", () => {
    let cyclicGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.CYCLIC]})

    expect(cyclicGroup12.operations.length).toEqual(12)
    expect(cyclicGroup12.cardinal).toEqual(12)

    expect(cyclicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(cyclicGroup12.orbits.length).toEqual(352)
    expect(cyclicGroup12.orbitsSortedByMotifStabilizers.length).toEqual(1)

    // M1-T0 (335), M1-T0~1* (2), M1-T0~2* (1), M1-T0~3* (2), M1-T0~4* (3), M1-T0~6* (9)
    expect(cyclicGroup12.orbitsSortedByStabilizers.length).toEqual(6)
  })

  it("Predefined Dihedral Group Action n=12", () => {
    let dihedralGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.DIHEDRAL]})

    expect(dihedralGroup12.operations.length).toEqual(24)
    expect(dihedralGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(dihedralGroup12.orbits.length).toEqual(224)
    expect(dihedralGroup12.orbitsSortedByMotifStabilizers.length).toEqual(2)

    // TODO to demonstrate mathematically
    expect(dihedralGroup12.orbitsSortedByStabilizers.length).toEqual(29)
  })


  it("Predefined Affine Group Action n=12", () => {
    let affineGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.AFFINE]})

    expect(affineGroup12.operations.length).toEqual(48)
    expect(affineGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(affineGroup12.orbits.length).toEqual(158)
    expect(affineGroup12.orbitsSortedByMotifStabilizers.length).toEqual(5)

    // TODO to demonstrate mathematically
    expect(affineGroup12.orbitsSortedByStabilizers.length).toEqual(42)
  })


  it("Predefined Group Action n=7", () => {
    const group7Cyclic = GroupAction.predefinedGroupsActions(7, Group.CYCLIC)
    expect(group7Cyclic.cardinal).toEqual(7)
    expect(group7Cyclic.powerset.size).toEqual(Math.pow(2, 7))

  })


  it("getOrbitOf cyclic12", () => {
    let cyclicGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.CYCLIC]})

    let ipcs = new IPcs({strPcs: "0, 4, 8", iPivot: 0})
    let orbit = cyclicGroup12.getOrbitOf(ipcs)
    expect(orbit.cardinal).toEqual(4)

    ipcs = new IPcs({strPcs: "0, 1, 6, 7", iPivot: 0})
    orbit = cyclicGroup12.getOrbitOf(ipcs)
    expect(orbit.cardinal).toEqual(6)

    ipcs = new IPcs({strPcs: "0, 1, 2, 3", iPivot: 0})
    expect(cyclicGroup12.getOrbitOf(ipcs).cardinal).toEqual(12)

    ipcs = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivot: 0})
    expect(cyclicGroup12.getOrbitOf(ipcs).cardinal).toEqual(12)

    ipcs = new IPcs({strPcs: "0, 1, 3, 5, 6, 8, 10", iPivot: 0})
    expect(cyclicGroup12.getOrbitOf(ipcs).cardinal).toEqual(12)

    ipcs = new IPcs({strPcs: "0, 3, 6, 9", iPivot: 0})
    orbit = cyclicGroup12.getOrbitOf(ipcs)
    expect(orbit.cardinal).toEqual(3)

  })

  it("getOrbitOf with bad pcsList", () => {
    const cyclicGroup12 = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    const ipcs = new IPcs({strPcs: "0, 1, 2", n: 5})

    try {
      // pcsList.n = 5 or group is n = 12 !
      const orbit = cyclicGroup12.getOrbitOf(ipcs)
      // waiting exception
      fail("Impossible operation !!")
    } catch (e: any) {
      expect(e.message).toContain('Invalid dimension')
    }
  })

  it("getIPcsInOrbit with bad pcsList", () => {
    const cyclicGroup12 = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    let badIpcs = new IPcs({strPcs: "0, 1, 2", n: 5})
    const ipcs = new IPcs({strPcs: "0, 6", n: 12})

    try {
      const ipcsWithOrbit = cyclicGroup12.getIPcsInOrbit(ipcs)
      expect(ipcsWithOrbit.orbit.cardinal).toEqual(6)

      cyclicGroup12.getIPcsInOrbit(badIpcs)
      // waiting exception
      fail("Impossible operation !!")
    } catch (e: any) {
      expect(e.message).toContain('Invalid')
    }
  })

  it("Orbits sorted trivial group", () => {
    const opNeutral = new MusaicPcsOperation(12, 1, 0);
    const trivialGroup = new GroupAction({n: 12, someMusaicOperations: [opNeutral]});
    expect(trivialGroup.powerset.size).toEqual(Math.pow(2, 12))
    expect(trivialGroup.orbits.length).toEqual(Math.pow(2, 12))
    // only one stabilizer

    expect(trivialGroup.orbitsSortedByStabilizers.length).toEqual(1)
    expect(trivialGroup.orbitsSortedByMotifStabilizers.length).toEqual(1)

    // n+1 because detached set count for one
    expect(trivialGroup.orbitsSortedByCardinal.length).toEqual(trivialGroup.n + 1)
  });

  it("Orbits sorted cyclic group", () => {

    const cyclicGroup = GroupAction.predefinedGroupsActions(12, Group.CYCLIC);
    expect(cyclicGroup.powerset.size).toEqual(Math.pow(2, 12))
    expect(cyclicGroup.orbits.length).toEqual(352)
    // only 12 stabilizer
    expect(cyclicGroup.orbitsSortedByStabilizers.length).toEqual(6)

    // M1 because MotifStabilizers does not have Tx operations, ans M1 is alone
    expect(cyclicGroup.orbitsSortedByMotifStabilizers.length).toEqual(1)
    expect(cyclicGroup.orbitsSortedByMotifStabilizers[0].groupingCriterion).toEqual('M1')

    // n+1 because detached set count for one
    expect(cyclicGroup.orbitsSortedByCardinal.length).toEqual(cyclicGroup.n + 1)
  });

  it("get predefined action group", () => {
    const cyclicGroup = GroupAction.predefinedGroupsActions(12, Group.CYCLIC);
    expect(cyclicGroup).toBeTruthy()
    try {
      const badGroup = GroupAction.predefinedGroupsActions(10, Group.CYCLIC);
    } catch (e: any) {
      fail("Cyclic group not construct !")
    }
  });

  /////////// Math POC

  /**
   * <pre>
   * |Orbit(x)| = |G| / |Stab(x)|
   * </pre>
   *
   * i.e. cardinal of an orbit o is equals to the number operations of group
   * div by number stabilized operations of any element of the orbit o
   *
   * @see https://en.wikipedia.org/wiki/Group_action#Orbit-stabilizer_theorem_and_Burnside.27s_lemma
   */
  it('test_Orbit_Stabilizer_Theorem', () => {
    const groupMusaic = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    groupMusaic.orbits.forEach((orbit) => {
      const min: IPcs = orbit.getPcsMin()
      expect(orbit.cardinal).toEqual(
        groupMusaic.cardinal / min.stabilizer.cardinal)
    })
  })


  /**
   * <pre>
   * orbit-counting theorem - Burnside's lemma
   * |X/G| = (sum |Fix.g| for all g in G) / |G|
   * </pre>
   *
   * \left|X/G\right|={\frac {1}{\left|G\right|}}\sum _{g\in
   * G}\left|X^{g}\right|,
   *
   * @see https://en.wikipedia.org/wiki/Burnside%27s_lemma
   */
  it('test_Orbit_Counting_Theorem_Burnside', () => {
    const groupMusaic = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    expect(groupMusaic.operations.length).toEqual(96)

    const totalCardFixedPcs = groupMusaic.operations.reduce(
      (cardFixedPcs: number, currentValue) =>
        currentValue.getFixedPcs().length + cardFixedPcs,
      0)

    expect(8448).toEqual(totalCardFixedPcs);

    // expect that 88 = 8448 / 96
    expect(groupMusaic.orbits.length).toEqual(totalCardFixedPcs / groupMusaic.operations.length);
    // same
    expect(88).toEqual(totalCardFixedPcs / 96);

  })

  it('Skeleton for initiate list of 2048 modes/scales ', () => {
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    let nbModes = 0
    for (const orbit of groupCyclic.orbits) {
      nbModes += orbit.getPcsMin().cardOrbitMode()
    }

    expect(nbModes).toEqual(2048)

    // other algorithm
    // key : Intervallic Structure
    // value : array of string (IPcs)
    const isDict = new Map<string, string>()
    let dic = []
    for (let pcs of groupCyclic.powerset.values()) {
      if (pcs.is().toString())
        if (!isDict.has(pcs.is().toString())) {
          isDict.set(pcs.is().toString(), pcs.getPcsStr())
        }
    }

    // expect(isDict.size).toEqual(24318)
    expect(isDict.size).toEqual(2048) // +1 for empty pcsList

    // from 4096 no cyclic equiv : 24318 (some says 24576 but is not because Limited Transposition)

    // console.log("======== 2048 gammes/modes")

    let array =
      Array.from(isDict, ([name, value]) => ({
        is: name,
        name: '',
        pcs: value,
        id88: 0,
        sources: [
          {source: ""}
         ]
      }));
    expect(array.length).toEqual(2048)
    // console.log(JSON.stringify(array))
    // console.log(JSON.stringify(array.length))
  })


  it('List of scales grouped by same IV', () => {
    const groupCyclic  = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    expect(groupCyclic.operations.length).toEqual(12)
    expect(groupCyclic.orbits.length).toEqual(352)
    const pcsGroupedByIV = new Map<string, IPcs[]>
    for (const orbit of groupCyclic.orbits) {
      const pcsPF = orbit.getPcsMin()
      if ( ! pcsGroupedByIV.has(pcsPF.iv().toString())) {
        pcsGroupedByIV.set(pcsPF.iv().toString(), [pcsPF])
      } else {
        pcsGroupedByIV.get(pcsPF.iv().toString())!.push(pcsPF)
      }
    }
    // check how many groupings are there
    console.log("pcsGroupedByIV.size = " + pcsGroupedByIV.size)

    // TODO find reference !
    expect(pcsGroupedByIV.size).toEqual(200)

    // show pcs that are alone in this grouping
    let soloIV = 0
    for (const pcsGroupingByIV of pcsGroupedByIV) {
      if (pcsGroupingByIV[1].length == 1) {
        soloIV++
        // console.log("pcs alone : iv() =" + pcsGroupingByIV[0]
        //   + " pcs=" + pcsGroupingByIV[1][0].getPcsStr(false)
        // )
      }
    }
    console.log("nb pcs with unique iv() : " + soloIV)
  });

})
