/*
 * Copyright (c) 2019. Olivier Capuozzo
 */

import {GroupAction} from "./GroupAction"
import {IPcs} from "./IPcs";
import {MusaicOperation} from "./MusaicOperation";
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

  it("Action trivial group n = 12 ", () => {
    let opNeutral = new MusaicOperation(12, 1, 0);
    let musaicGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral]});
    expect(musaicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(musaicGroup12.orbits.length).toEqual(Math.pow(2, 12))
    // only one stabilizer
    expect(musaicGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(1)
  });

  it("Action cyclic group n = 12 ", () => {
    let opNeutral = new MusaicOperation(12, 1, 0);
    let opM1T1 = new MusaicOperation(12, 1, 1);
    let cyclicGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opM1T1]});

    expect(cyclicGroup12.operations.length).toEqual(12)
    expect(cyclicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(cyclicGroup12.orbits.length).toEqual(352)

    // console.log("first stab : " + cyclicGroup12.orbitsSortedGroupedByStabilizers[0].groupingCriterion)
    expect(cyclicGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(6)

    let nbPcs = 0
    let nLimitedTransposition = 0
    let orbitByStabShortName = new Set()
    cyclicGroup12.orbits.forEach(
      orbit => {
        orbitByStabShortName.add(orbit.name)
        orbit.stabilizers.forEach((stab => {
          nbPcs += stab.fixedPcs.length
          // skip trivial stab
          if (stab.operations.length > 1) {
            nLimitedTransposition ++
          }
        }))
      })

    // 2^12 = 4096
    expect(nbPcs).toEqual(4096)
    // 17 LTs is-motifs
    expect(nLimitedTransposition).toEqual(17)

    // 5 classes of limited transposition plus identity stab ([M1-T0]), so 6 waiting
    // expected 6 stabilizer names (2/1 , 54/6 , 12/4 , 6/3 , 2/2 and 4020/12)
    // (sorted by name) M1-T0 M1-T0~1* M1-T0~2* M1-T0~3* M1-T0~4* M1-T0~6*
    expect(cyclicGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(6)

    // There are 335 orbits transposable 12 times and 17 in limited transposition
    // When filter all orbits with cardinal < 335, we should get 17 orbits
    let sumLTs = cyclicGroup12.orbitsSortedGroupedByStabilizers
      .filter(sortedOrbit => sortedOrbit.orbits.length < 335)
      .reduce((sum, current) => sum + current.orbits.length, 0)
    expect(sumLTs).toEqual(17)
  });

  it("Action dihedral group n = 12 ", () => {
    let opNeutral = new MusaicOperation(12, 1, 0);

    let opM1T1 = new MusaicOperation(12, 1, 1);
    let opM11 = new MusaicOperation(12, 11, 0);
    let dihedralGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opM1T1, opM11]});
    expect(dihedralGroup12.operations.length).toEqual(24)
    expect(dihedralGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(dihedralGroup12.orbits.length).toEqual(224)

    // test orbit short name or not
    const allOpsDihedral = 'M1-T0 M1-T1 M1-T2 M1-T3 M1-T4 M1-T5 M1-T6 M1-T7 M1-T8 M1-T9 M1-T10 M1-T11 M11-T0 M11-T1 M11-T2 M11-T3 M11-T4 M11-T5 M11-T6 M11-T7 M11-T8 M11-T9 M11-T10 M11-T11'
    expect(dihedralGroup12.orbits[0].getAllSignatureStabilizers()).toEqual(allOpsDihedral)
    expect(dihedralGroup12.orbits[0].name).toEqual("M1-T0~1* M11-T0~1*")

    // test orbit short name or not : same cardinal when grouped by stab

    expect(dihedralGroup12.computeOrbitSortedGroupedByStabilizers(false).length).toEqual(35)
    expect(dihedralGroup12.computeOrbitSortedGroupedByStabilizers(true).length).toEqual(35)
    expect(dihedralGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(35)

  });

  it("Action affine group n = 12 ", () => {
    let opNeutral = new MusaicOperation(12, 1, 0);
    let opT1 = new MusaicOperation(12, 1, 1);
    let opM5 = new MusaicOperation(12, 5, 0);
    let opM7 = new MusaicOperation(12, 7, 0);
    let musaicGroup12 = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opT1, opM5, opM7]});
    expect(musaicGroup12.operations.length).toEqual(48)
    expect(musaicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(musaicGroup12.orbits.length).toEqual(158)
  });

  it("Action musaic group n = 5 ", () => {
    let opNeutral = new MusaicOperation(5, 1, 0);
    let opCM1 = new MusaicOperation(5, 1, 1, true);

    let musaicGroup5 = new GroupAction({n: 5, someMusaicOperations: [opNeutral, opCM1]});

    expect(musaicGroup5.powerset.size).toEqual(Math.pow(2, 5))
    expect(musaicGroup5.orbits.length).toEqual(4)

  });

  /**
   * TODO : (a first ?) comment to be checked in proofreading / code review !!
   * If group has a complemented operation then this group must have CM1-T1 op
   * because pcs complemented lost his iPivot... So equivalence relation must include
   * "to a near transposition"
   */
  it("group with complemented op and no T (n = 12)", () => {
    let complemented = true
    let opNeutral = new MusaicOperation(12, 1, 0);
    let opCM1 = new MusaicOperation(12, 1, 0, complemented);
    let opM5 = new MusaicOperation(12, 5, 0, complemented);
    let opM7 = new MusaicOperation(12, 7, 0, !complemented);
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
    let opNeutral = new MusaicOperation(12, 1, 0);
    let opM5 = new MusaicOperation(12, 5, 0, !complemented);
    let opM7 = new MusaicOperation(12, 7, 0, !complemented);

    let group = new GroupAction({n: 12, someMusaicOperations: [opNeutral, opM5, opM7]});

    if (group.orbitsSortedGroupedByMetaStabilizer === undefined) {
      throw new Error("group.orbitsSortedGroupedByMetaStabilizer undefined")
    }

    try {
      expect(group.orbits.length).toEqual(1886)
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
    expect(musaicGroup12.orbitsSortedGroupedByMetaStabilizer.length).toEqual(13)

    // TODO to demonstrate mathematically
    expect(musaicGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(27)

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
    expect(cyclicGroup12.orbitsSortedGroupedByMetaStabilizer.length).toEqual(1)

    // M1-T0 (335), M1-T0~1* (2), M1-T0~2* (1), M1-T0~3* (2), M1-T0~4* (3), M1-T0~6* (9)
    expect(cyclicGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(6)
  })

  it("Predefined Dihedral Group Action n=12", () => {
    let dihedralGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.DIHEDRAL]})

    expect(dihedralGroup12.operations.length).toEqual(24)
    expect(dihedralGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(dihedralGroup12.orbits.length).toEqual(224)
    expect(dihedralGroup12.orbitsSortedGroupedByMetaStabilizer.length).toEqual(2)

    // TODO to demonstrate mathematically
    expect(dihedralGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(35)
  })


  it("Predefined Affine Group Action n=12", () => {
    let affineGroup12
      = new GroupAction({group: Group.predefinedGroups12[Group.AFFINE]})

    expect(affineGroup12.operations.length).toEqual(48)
    expect(affineGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(affineGroup12.orbits.length).toEqual(158)
    expect(affineGroup12.orbitsSortedGroupedByMetaStabilizer.length).toEqual(5)

    // TODO to demonstrate mathematically
    expect(affineGroup12.orbitsSortedGroupedByStabilizers.length).toEqual(52)
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

  it("getOrbitOf with bad ", () => {
    const cyclicGroup12 = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    const ipcs = new IPcs({strPcs: "0, 1, 2", n: 5})

    try {
      // pcsList.n = 5 or group is n = 12 !
      cyclicGroup12.getOrbitOf(ipcs)
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
    const opNeutral = new MusaicOperation(12, 1, 0);
    const trivialGroup = new GroupAction({n: 12, someMusaicOperations: [opNeutral]});
    expect(trivialGroup.powerset.size).toEqual(Math.pow(2, 12))
    expect(trivialGroup.orbits.length).toEqual(Math.pow(2, 12))
    // only one stabilizer

    expect(trivialGroup.orbitsSortedGroupedByStabilizers.length).toEqual(1)
    expect(trivialGroup.orbitsSortedGroupedByMetaStabilizer.length).toEqual(1)

    // n+1 because detached set count for one
    expect(trivialGroup.orbitsSortedGroupedByCardinal.length).toEqual(trivialGroup.n + 1)
  });

  it("Orbits sorted cyclic group", () => {

    const cyclicGroup = GroupAction.predefinedGroupsActions(12, Group.CYCLIC);
    expect(cyclicGroup.powerset.size).toEqual(Math.pow(2, 12))
    expect(cyclicGroup.orbits.length).toEqual(352)
    // only 12 stabilizer
    expect(cyclicGroup.orbitsSortedGroupedByStabilizers.length).toEqual(6)

    // M1 because MetaStabilizers does not have Tx operations, and M1 is alone
    expect(cyclicGroup.orbitsSortedGroupedByMetaStabilizer.length).toEqual(1)
    expect(cyclicGroup.orbitsSortedGroupedByMetaStabilizer[0].groupingCriterion).toEqual('M1')

    // n+1 because detached set count for one
    expect(cyclicGroup.orbitsSortedGroupedByCardinal.length).toEqual(cyclicGroup.n + 1)
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


  it("Group with T0 only ", () => {
    let opNeutral = new MusaicOperation(12, 1, 0);
    let m5_t0 = new MusaicOperation(12, 5, 0);
    let m11_t0 = new MusaicOperation(12, 11, 0);
    let cm1_t0 = new MusaicOperation(12, 1, 0, true);

    let group =
      new GroupAction({n: 12, someMusaicOperations: [opNeutral, m5_t0,m11_t0, cm1_t0]});

    // group.operations.forEach(operation => {console.log(operation.toString())})

    expect(group.orbits.length).toEqual(919) // from musaicboxapp
    const orbit = group.orbits.find((orbit) => orbit.name === "M1-T0 M11-T0");

    expect(orbit).toBeTruthy()

    const pcsM11_T0 = orbit?.ipcsset[0].affineOp(11,0)
    const pcsM11_T1 = orbit?.ipcsset[0].affineOp(11,1)

    expect(orbit?.ipcsset.some( (pcs) => pcs.id === pcsM11_T0?.id ?? 0)).toBeTruthy()
    expect(orbit?.ipcsset.some((pcs) => pcs.id === pcsM11_T1?.id ?? 0)).toEqual(false)

  })


  })
