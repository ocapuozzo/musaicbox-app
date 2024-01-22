/*
 * Copyright (c) 2019. Olivier Capuozzo
 */

import {GroupAction} from "./GroupAction"
import {IPcs} from "./IPcs";
import {MusaicPcsOperation} from "./MusaicPcsOperation";
// import {ISortedOrbits} from "./ISortedOrbits";
import {Group} from "./Group";

describe('GroupAction', () => {

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
   * because ipcs complemented lost his iPivot... So equivalence relation must include
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
      = new GroupAction({group: Group.predefinedGroups[Group.MUSAIC]})

    expect(musaicGroup12.operations.length).toEqual(96)
    expect(musaicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(musaicGroup12.orbits.length).toEqual(88)
    expect(musaicGroup12.orbitsSortedByMotifStabilizers.length).toEqual(13)
    expect(musaicGroup12.orbitsSortedByStabilizers.length).toEqual(111)

    let lastPF = new IPcs({pidVal: 1365, n: 12}) // whole tone scale
    // test equality of PCS
    expect(musaicGroup12.orbits[musaicGroup12.orbits.length - 1].getPcsMin().equalsPcs(lastPF)).toBeTruthy()
    // whole tone scale : 2 in orbit
    expect(musaicGroup12.orbits[musaicGroup12.orbits.length - 1].ipcsset.length).toEqual(2)

    // TODO 326 must be verified
    expect(musaicGroup12.cardinalOfOrbitStabilized()).toEqual(326)
  })


  it("Predefined Cyclic Group Action n=12", () => {
    let cyclicGroup12
      = new GroupAction({group: Group.predefinedGroups[Group.CYCLIC]})

    expect(cyclicGroup12.operations.length).toEqual(12)
    expect(cyclicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(cyclicGroup12.orbits.length).toEqual(352)
    expect(cyclicGroup12.orbitsSortedByMotifStabilizers.length).toEqual(1)

    // M1-T0 (335), M1-T0~1* (2), M1-T0~2* (1), M1-T0~3* (2), M1-T0~4* (3), M1-T0~6* (9)
    expect(cyclicGroup12.orbitsSortedByStabilizers.length).toEqual(6)
  })

  it("Predefined Dihedral Group Action n=12", () => {
    let cyclicGroup12
      = new GroupAction({group: Group.predefinedGroups[Group.DIHEDRAL]})

    expect(cyclicGroup12.operations.length).toEqual(24)
    expect(cyclicGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(cyclicGroup12.orbits.length).toEqual(224)
    expect(cyclicGroup12.orbitsSortedByMotifStabilizers.length).toEqual(2)

    // TODO to demonstrate mathematically
    expect(cyclicGroup12.orbitsSortedByStabilizers.length).toEqual(29)
  })


  it("Predefined Affine Group Action n=12", () => {
    let affineGroup12
      = new GroupAction({group: Group.predefinedGroups[Group.AFFINE]})

    expect(affineGroup12.operations.length).toEqual(48)
    expect(affineGroup12.powerset.size).toEqual(Math.pow(2, 12))
    expect(affineGroup12.orbits.length).toEqual(158)
    expect(affineGroup12.orbitsSortedByMotifStabilizers.length).toEqual(5)

    // TODO to demonstrate mathematically
    expect(affineGroup12.orbitsSortedByStabilizers.length).toEqual(63)
  })


})
