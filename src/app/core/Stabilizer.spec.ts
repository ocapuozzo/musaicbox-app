/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {MusaicPcsOperation} from "./MusaicPcsOperation";
import {Stabilizer} from "./Stabilizer";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";

describe('Stabilizer', () => {
  it("Stabilizer addOperation and compare", () => {
    let opM5T0 = new MusaicPcsOperation(12, 5, 0, false);
    let opM5T4 = new MusaicPcsOperation(12, 5, 4, false);
    let opM7T0 = new MusaicPcsOperation(12, 7, 0, false);
    let opM11T2 = new MusaicPcsOperation(12, 11, 2, false);
    let opCM5T0 = new MusaicPcsOperation(12, 5, 0, true);
    let stab1 = new Stabilizer()
    stab1.addOperation(opM5T0)
    stab1.addOperation(opM7T0)
    expect(stab1.operations.length).toEqual(2);
    expect(stab1.cardinal).toEqual(2);

    stab1.addOperation(opM5T4)
    expect(stab1.operations.length).toEqual(3);
    expect(stab1.cardinal).toEqual(3);

    expect(stab1.compareTo(stab1)).toEqual(0)


    expect(stab1.operations[1]).toEqual(opM5T4)
    stab1.addOperation(opM11T2)
    expect(stab1.operations.length).toEqual(4);
    expect(stab1.operations[1]).toEqual(opM5T4)
    expect(stab1.operations[3]).toEqual(opM11T2)

    stab1.addOperation(opCM5T0)
    expect(stab1.operations.length).toEqual(5);
    expect(stab1.operations[1]).toEqual(opM5T4)
    expect(stab1.operations[3]).toEqual(opM11T2)
    expect(stab1.operations[4]).toEqual(opCM5T0)

    // console.log("stab1 :" + stab1)
  })

  it("Stabilizer compare", () => {
    let opM5T0 = new MusaicPcsOperation(12, 5, 0, false);
    let opM5T4 = new MusaicPcsOperation(12, 5, 4, false);
    let opM7T0 = new MusaicPcsOperation(12, 7, 0, false);
    let opM11T2 = new MusaicPcsOperation(12, 11, 2, false);
    let opCM5T0 = new MusaicPcsOperation(12, 5, 0, true);
    let stab1 = new Stabilizer()
    let stab2 = new Stabilizer()
    let stab3 = new Stabilizer()
    stab1.addOperation(opM5T0)
    stab1.addOperation(opM7T0)
    stab1.addOperation(opM5T4)
    stab2.addOperation(opM5T0)
    stab2.addOperation(opCM5T0)
    stab2.addOperation(opM11T2)
    stab3.addOperation(opM5T4)

    let stabs = [stab1, stab3, stab2]
    /*
    M5-T0,M5-T4,M7-T0
    M5-T4
    M5-T0,M11-T2,CM5-T0
    */
    stabs.sort(Stabilizer.compare)
    /*
    M5-T0,M5-T4,M7-T0
    M5-T0,M11-T2,CM5-T0
    M5-T4
   */
    // stabs.forEach(stab => {
    //   console.log("stab :" + stab.operations)
    // })

    expect(stabs[0].equals(stab1)).toBeTruthy();
    expect(stabs[1].equals(stab2)).toBeTruthy();
  })

  it("Stabilizer reduceNameByIgnoreTransp", () => {
    let opM5T0 = new MusaicPcsOperation(12, 5, 0, false);
    let opM5T4 = new MusaicPcsOperation(12, 5, 4, false);
    let opM7T0 = new MusaicPcsOperation(12, 7, 0, false);
    let opM11T2 = new MusaicPcsOperation(12, 11, 2, false);
    let opCM5T0 = new MusaicPcsOperation(12, 5, 0, true);
    let stab = new Stabilizer()
    stab.addOperation(opM5T0)
    stab.addOperation(opM7T0)
    stab.addOperation(opM5T4)
    stab.addOperation(opCM5T0)
    stab.addOperation(opM11T2)

    expect(stab.reduceNameByIgnoreTransp()).toEqual("M5,M7,M11,CM5");
  })

  it("Cyclic Group Explore", () => {
    let opId = new MusaicPcsOperation(12, 1, 0);
    let opM1T1 = new MusaicPcsOperation(12, 1, 1);

    let cyclicGroup = new GroupAction({n: 12, someMusaicOperations: [opId, opM1T1]});

    // number of orbits
    expect(cyclicGroup.orbits.length).toEqual(352);

    let sumPcs = 0;
    cyclicGroup.orbits.forEach(orbit => sumPcs += orbit.ipcsset.length)
    expect(sumPcs).toEqual(4096)

    let setStabilizers = new Set()
    // each orbit has stabilisers
    cyclicGroup.orbits.forEach(orbit => {
      orbit.stabilizers.forEach(stab => {
        setStabilizers.add(stab.hashCode())
      })
    })
    // 5 classes of limited transposition plus identity stab ([M1-T0]), so 6 waiting
    // expected 6 stabilizers (2/1 , 54/6 , 12/4 , 6/3 , 2/2 and 4020/12)
    expect(setStabilizers.size).toEqual(6) // = 6
    expect(cyclicGroup.orbitsSortedByStabilizers.length).toEqual(6)
    // cyclicGroup.orbitsSortedByStabilizers.forEach(stab=> console.log("stab name : "+ stab.stabilizerName))
  })

  it("Musaic Group Explore n=12", () => {
    let opM1 = new MusaicPcsOperation(12, 1, 0, false);
    let opCM1 = new MusaicPcsOperation(12, 1, 0, true);
    let opM1T1 = new MusaicPcsOperation(12, 1, 1, false);
    let opM5T1 = new MusaicPcsOperation(12, 5, 1, false);
    let opM7T1 = new MusaicPcsOperation(12, 7, 1, false);

    let musaicGroup = new GroupAction({
      n: 12,
      someMusaicOperations: [/*opId,*/ opM1, opCM1, opM1T1, opM5T1, opM7T1]
    });

    expect(musaicGroup.operations.length).toEqual(96);
    // number of orbits
    expect(musaicGroup.orbits.length).toEqual(88);

    let sumPcs = 0;
    musaicGroup.orbits.forEach(orbit => sumPcs += orbit.ipcsset.length)
    expect(sumPcs).toEqual(4096)

    let setStabilizers = new Set()
    // each orbit has stabilisers
    musaicGroup.orbits.forEach(orbit => {
      orbit.stabilizers.forEach(stab => setStabilizers.add(stab.hashCode()))
    })
    expect(setStabilizers.size).toEqual(111)
    expect(musaicGroup.orbitsSortedByMotifStabilizers.length).toEqual(13)

    // expect(musaicGroup.orbitsSortedByStabilizers.length).toEqual(111)

//  musaicGroup.orbitsSortedByMotifStabilizers.forEach(motifSatb => console.log(motifSatb.toString()))
  })

  it("Stabilizer isMotifEquivalence", () => {
    let opM1T0 = new MusaicPcsOperation(12, 1, 0, false);
    let stab = new Stabilizer({operations: [opM1T0]})

    expect(stab.isMotifEquivalence).not.toBeTruthy()

    // equivalence relationship to near transposition
    let opM1T1 = new MusaicPcsOperation(12, 1, 1, true);
    stab.addOperation(opM1T1)

    expect(stab.isMotifEquivalence).toBeTruthy()
  })


  it("equals", () => {
    let opM1T0 = new MusaicPcsOperation(12, 1, 0, false);
    let stab1 = new Stabilizer({operations: [opM1T0]})
    let stab2 = new Stabilizer({operations: [opM1T0]})

    expect(stab1.equals(stab2)).toBe(true)

    // equivalence relationship to near transposition
    let opM1T1 = new MusaicPcsOperation(12, 1, 1, true);
    stab1.addOperation(opM1T1)

    expect(stab1.equals(stab2)).toBe(false)

    stab2.addOperation(opM1T1)
    expect(stab1.equals(stab2)).toBe(true)

    expect(stab1.equals(null)).toBe(false)
    expect(stab1.equals(42)).toBe(false)
  })

  it("Group Explore n=7", () => {
    let opId = new MusaicPcsOperation(7, 1, 0)
    let opM3 = new MusaicPcsOperation(7, 3, 0);

    let group = new GroupAction({n: 7, someMusaicOperations: [opId]});
    expect(group.powerset.size).toEqual(128)
    expect(group.operations.length).toEqual(1);

    group = new GroupAction({n: 7, someMusaicOperations: [opId, opM3]});
    expect(group.powerset.size).toEqual(128)
    expect(group.operations.length).toEqual(6);
    expect(group.orbits.length).toEqual(49);

    let sumPcs = 0;
    group.orbits.forEach(orbit => sumPcs += orbit.ipcsset.length)

    let mapPcs = new Map() // k : id, v : [] of pcsList
    group.orbits.forEach((orbit) => {
      orbit.ipcsset.forEach((p) => {
        if (!mapPcs.has(p.id)) {
          mapPcs.set(p.id, [])
        }
        mapPcs.get(p.id).push(p)
      })
    })
    //  console.log("mapPcs size : " + mapPcs.size)
    expect(sumPcs).toEqual(group.powerset.size)
    let names = ""
    group.orbitsSortedByStabilizers.forEach(stab => names += stab.groupingCriterion) //console.log("stab name : "+ stab.stabilizerName))
  })

  it("Group Explore n=7 cyclic shortname", () => {
    let opId = new MusaicPcsOperation(7, 1, 0)
    let opM1T1 = new MusaicPcsOperation(7, 1, 1);

    let group = new GroupAction({n: 7, someMusaicOperations: [opId, opM1T1]});
    expect(group.powerset.size).toEqual(128)
    expect(group.operations.length).toEqual(7);
    expect(group.orbits.length).toEqual(20);

    let sumPcs = 0;
    group.orbits.forEach(orbit => sumPcs += orbit.ipcsset.length)
    expect(sumPcs).toEqual(group.powerset.size)

    let shortNames: string[] = []
    group.orbitsSortedByMotifStabilizers.forEach(stab => shortNames.push(stab.groupingCriterion))
    expect(shortNames).toEqual(["M1"])

    shortNames = []
    group.orbitsSortedByStabilizers.forEach(stab => shortNames.push(stab.groupingCriterion))
    // neutral op and detached and full IPcs (2 pcsList) transposables 7 times in same state by step 1
    expect(shortNames).toEqual(["M1-T0", "M1-T0~1*"])
  })

  it("toString", () => {
    const group = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    const stabStr = group.orbitsSortedByStabilizers[0].orbits[0].stabilizers[0].toString()

    expect(stabStr).toContain('Stab: M1-T0 #FixedPcs: 96')

    let pcs = group.orbitsSortedByStabilizers[0].orbits[0].stabilizers[0].fixedPcs[1].getPcsStr()
    expect(pcs).toEqual('[0,2,3]') // 12 in orbit
    pcs = group.orbitsSortedByStabilizers[0].orbits[0].stabilizers[0].fixedPcs[0].getPcsStr()
    expect(pcs).toEqual('[0,1,3]') // idem
  })

  //
  // it("isInclude", () => {
  //   const group = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
  //   const stab = group.orbitsSortedByStabilizers[2].orbits[2].stabilizers[0]
  //
  //   const stabStr = group.orbitsSortedByStabilizers[2].orbits[2].stabilizers[0].toString()
  //
  //   expect(stabStr).toEqual('Stab: M1-T0,CM11-T11 #FixedPcs: 12')
  //
  //   let opId = new MusaicPcsOperation(12, 1, 0)
  //   let opCM11T11 = new MusaicPcsOperation(12, 11, 11, true);
  //
  //   let opM11T11 = new MusaicPcsOperation(12, 11, 11, false);
  //
  //   expect(stab.isInclude([opCM11T11])).toBe(true)
  //   expect(stab.isInclude([opId])).toBe(true)
  //   expect(stab.isInclude([opId, opCM11T11])).toBe(true)
  //   expect(stab.isInclude([opId, opCM11T11])).toBe(true)
  //   expect(stab.isInclude([opM11T11])).toBe(false)
  //   expect(stab.isInclude([opId, opM11T11])).toBe(false)
  // })

})
