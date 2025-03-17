/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {MusaicOperation} from "./MusaicOperation";
import {Stabilizer} from "./Stabilizer";
import {GroupAction} from "./GroupAction";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

describe('Stabilizer', () => {
  it("Stabilizer addOperation and compare", () => {
    let opM5T0 = new MusaicOperation(12, 5, 0, false);
    let opM5T4 = new MusaicOperation(12, 5, 4, false);
    let opM7T0 = new MusaicOperation(12, 7, 0, false);
    let opM11T2 = new MusaicOperation(12, 11, 2, false);
    let opCM5T0 = new MusaicOperation(12, 5, 0, true);
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
    let opM5T0 = new MusaicOperation(12, 5, 0, false);
    let opM5T4 = new MusaicOperation(12, 5, 4, false);
    let opM7T0 = new MusaicOperation(12, 7, 0, false);
    let opM11T2 = new MusaicOperation(12, 11, 2, false);
    let opCM5T0 = new MusaicOperation(12, 5, 0, true);
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
    let opM5T0 = new MusaicOperation(12, 5, 0, false);
    let opM5T4 = new MusaicOperation(12, 5, 4, false);
    let opM7T0 = new MusaicOperation(12, 7, 0, false);
    let opM11T2 = new MusaicOperation(12, 11, 2, false);
    let opCM5T0 = new MusaicOperation(12, 5, 0, true);
    let stab = new Stabilizer()
    stab.addOperation(opM5T0)
    stab.addOperation(opM7T0)
    stab.addOperation(opM5T4)
    stab.addOperation(opCM5T0)
    stab.addOperation(opM11T2)

    expect(stab.reduceNameByIgnoreTransp()).toEqual("M5,M7,M11,CM5");
  })

  it("Cyclic Group Explore", () => {
    let opId = new MusaicOperation(12, 1, 0);
    let opM1T1 = new MusaicOperation(12, 1, 1);

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
    // 5 classes of limited transposition plus identity stab ([M1-T0]), so 6 expected
    // expected 6 stabilizers (2/1 , 54/6 , 12/4 , 6/3 , 2/2 and 4020/12)
    expect(setStabilizers.size).toEqual(6) // = 6
    expect(cyclicGroup.orbitsSortedGroupedByStabilizer.length).toEqual(6)
    // cyclicGroup.orbitsSortedGroupedByStabilizer.forEach(stab=> console.log("stab name : "+ stab.reducedStabilizersName))
  })

  it("Musaic Group Explore n=12", () => {
    let opM1 = new MusaicOperation(12, 1, 0, false);
    let opCM1 = new MusaicOperation(12, 1, 0, true);
    let opM1T1 = new MusaicOperation(12, 1, 1, false);
    let opM5T1 = new MusaicOperation(12, 5, 1, false);
    let opM7T1 = new MusaicOperation(12, 7, 1, false);

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
    expect(musaicGroup.orbitsSortedGroupedByMetaStabilizer.length).toEqual(13)

    // expect(musaicGroup.orbitsSortedGroupedByStabilizer.length).toEqual(111)

//  musaicGroup.orbitsSortedGroupedByMetaStabilizer.forEach(motifSatb => console.log(motifSatb.toString()))
  })

  it("Stabilizer isMotifEquivalence", () => {
    let opM1T0 = new MusaicOperation(12, 1, 0, false);
    let stab = new Stabilizer({operations: [opM1T0]})

    expect(stab.isMotifEquivalence).not.toBeTruthy()

    // equivalence relationship to near transposition
    let opM1T1 = new MusaicOperation(12, 1, 1, true);
    stab.addOperation(opM1T1)

    expect(stab.isMotifEquivalence).toBeTruthy()
  })


  it("equals", () => {
    let opM1T0 = new MusaicOperation(12, 1, 0, false);
    let stab1 = new Stabilizer({operations: [opM1T0]})
    let stab2 = new Stabilizer({operations: [opM1T0]})

    expect(stab1.equals(stab2)).toBe(true)

    // equivalence relationship to near transposition
    let opM1T1 = new MusaicOperation(12, 1, 1, true);
    stab1.addOperation(opM1T1)

    expect(stab1.equals(stab2)).toBe(false)

    stab2.addOperation(opM1T1)
    expect(stab1.equals(stab2)).toBe(true)

    expect(stab1.equals(null)).toBe(false)
    expect(stab1.equals(42)).toBe(false)
  })

  it("Group Explore n=7", () => {
    let opId = new MusaicOperation(7, 1, 0)
    let opM3 = new MusaicOperation(7, 3, 0);

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
    group.orbitsSortedGroupedByStabilizer.forEach(stab => names += stab.groupingCriterion) //console.log("stab name : "+ stab.reducedStabilizersName))
  })

  it("Group Explore n=7 cyclic shortname", () => {
    let opId = new MusaicOperation(7, 1, 0)
    let opM1T1 = new MusaicOperation(7, 1, 1);

    let group = new GroupAction({n: 7, someMusaicOperations: [opId, opM1T1]});
    expect(group.powerset.size).toEqual(128)
    expect(group.operations.length).toEqual(7);
    expect(group.orbits.length).toEqual(20);

    let sumPcs = 0;
    group.orbits.forEach(orbit => sumPcs += orbit.ipcsset.length)
    expect(sumPcs).toEqual(group.powerset.size)

    let shortNames: string[] = []
    group.orbitsSortedGroupedByMetaStabilizer.forEach(stab => shortNames.push(stab.groupingCriterion))
    expect(shortNames).toEqual(["M1"])

    shortNames = []
    group.orbitsSortedGroupedByStabilizer.forEach(stab => shortNames.push(stab.groupingCriterion))
    // neutral op and op transposables 7 times by step 1
    expect(shortNames).toEqual(["M1-T0~1*", "M1-T0"])
  })

  it("toString", () => {
    const group = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    const stabStr = group.orbitsSortedGroupedByStabilizer[0].orbits[0].stabilizers[0].toString()
    expect(stabStr).toContain('Stab: M1-T0,M1-T1,M1-T2,M1-T3,M1-T4,M1-T5,M1-T6,M1-T7,M1-T8,M1-T9,M1-T10,M1-T11,M5-T0,M5-T1,M5-T2,M5-T3,M5-T4,M5-T5,M5-T6,M5-T7,M5-T8,M5-T9,M5-T10,M5-T11,M7-T0,M7-T1,M7-T2,M7-T3,M7-T4,M7-T5,M7-T6,M7-T7,M7-T8,M7-T9,M7-T10,M7-T11,M11-T0,M11-T1,M11-T2,M11-T3,M11-T4,M11-T5,M11-T6,M11-T7,M11-T8,M11-T9,M11-T10,M11-T11 #FixedPcs: 2')
  })

  it('getShortName -> makeShortNameIfPossible', () =>{
    const opM1T0 = new MusaicOperation(12,1,0)
    const opM1T4 = new MusaicOperation(12,1,4)
    const opCM1T8 = new MusaicOperation(12,1,8,true)
    const opCM1T0 = new MusaicOperation(12,1,0,true)
    const opCM1T1 = new MusaicOperation(12,1,1,true)
    const opCM1T9 = new MusaicOperation(12,1,9,true)
    const opCM1T3 = new MusaicOperation(12,1,3,true)
    const opCM1T4 = new MusaicOperation(12,1,4,true)
    const opCM1T5 = new MusaicOperation(12,1,5,true)
    const opCM1T7 = new MusaicOperation(12,1,7,true)
    const opCM1T11 = new MusaicOperation(12,1,11,true)
    const opM11T1 = new MusaicOperation(12,11,1,false)

    const expected1 = "CM1-T0~4*"
    const expected2 = "CM1-T3~6*"
    const expected3 = "CM1-T1~2*"
    const expected4 = "M1-T0 M11-T1"

    // CM1-T0 CM1-T4 CM1-T8 => "CM1-T0~4*"
    expect(Stabilizer.makeShortNameIfPossible([opCM1T0, opCM1T4, opCM1T8])).toEqual(expected1)
    // CM1-T3 CM1-T9 => "CM1-T3~6*"
    expect(Stabilizer.makeShortNameIfPossible([opCM1T3, opCM1T9])).toEqual(expected2)
    // CM1-T1 CM1-T3 CM1-T5 CM1-T7 CM1-T9 CM1-T11 => "CM1-T1~2*"
    expect(Stabilizer.makeShortNameIfPossible([opCM1T1, opCM1T3, opCM1T5, opCM1T7, opCM1T9, opCM1T11])).toEqual(expected3)
    //M1-T0 M11-T1 => "M1-T0 M11-T1"
    expect(Stabilizer.makeShortNameIfPossible([opM1T0, opM11T1])).toEqual(expected4)

    //   CM1-T1 CM1-T3 CM1-T5 CM1-T7 /*CM1-T9*/ CM1-T11 =
    // "CM1-T1 CM1-T3 CM1-T5 CM1-T7 CM1-T11"
    // const expected5 = "CM1-T1~6* CM1-T3 CM1-T5 CM1-T11"
    const expected5Better = "CM1-T1~6* CM1-T3 CM1-T11~6*" // "CM1-T1~6* CM1-T3 CM1-T5~6*"
    expect(Stabilizer.makeShortNameIfPossible([opCM1T1, opCM1T3, opCM1T5, opCM1T7, /*opCM1T9,*/ opCM1T11])).toEqual(expected5Better)


    // M11-T1 M11-T2 M11-T4 M11-T5 M11-T7 M11-T8 M11-T10 M11-T11 => M11-T1~3* and M11-T2~3*
    const expected6 = "M11-T1~3* M11-T2~3*"
    expect(Stabilizer.makeShortNameIfPossible([
      new MusaicOperation(12,11,1),
      new MusaicOperation(12,11,2),
      new MusaicOperation(12,11,4),
      new MusaicOperation(12,11,5),
      new MusaicOperation(12,11,7),
      new MusaicOperation(12,11,8),
      new MusaicOperation(12,11,10),
      new MusaicOperation(12,11,11)
    ])).toEqual(expected6)

  })

  it('getCycleStep', () => {
    //
    expect(Stabilizer.getCycleStep([0,2,10]).step).toEqual(0)
    //
    expect(Stabilizer.getCycleStep([1,4,7,10])).toEqual({step:3, stepIndex:1})
    // 3 = 12/ (nb comparaisons + 1) stepIndex = 1
    //
    expect(Stabilizer.getCycleStep([1,4,7,10])).toEqual({step:3, stepIndex:1})
    // 3 = 12/ (nb comparaisons + 1) stepIndex = 1
    //
    expect(Stabilizer.getCycleStep([2,5,8,11])).toEqual({step:3, stepIndex:1})
    // 3 = 12/ (nb comparaisons + 1) stepIndex = 1
    //
    expect(Stabilizer.getCycleStep([1,2,4,5,7,8,10,11])).toEqual({step:3, stepIndex:2})
    // 3 = 12/ (nb comparaisons + 1 ) stepIndex = 2
    //
    expect(Stabilizer.getCycleStep([1,5,7,11])).toEqual({step:6, stepIndex:2})
    // 6 = 12/(nb comparaisons + 1) stepIndex = 2
    //
    expect(Stabilizer.getCycleStep([0,4,8])).toEqual({step:4, stepIndex:1})
    // 4 = 12/(nb comparaisons + 1) stepIndex = 1
    //
    expect(Stabilizer.getCycleStep([0,4,6,8])).toEqual({step:6, stepIndex:2})
    // 6 = 12/(nb comparaisons + 1) stepIndex = 2

    expect(Stabilizer.getCycleStep([0,6])).toEqual({step:6, stepIndex:1})
    // 6 = 12/(nb comparaisons + 1) stepIndex = 1


    expect(Stabilizer.getCycleStep([1,3,5,7])).toEqual({step:6, stepIndex:3})
    // stepIndex = 1 (3-1, 5-3, 7-5) => step=2
    //   but nb comparaisons+1 => 4, and 2 <> 12/4 NO !
    // stepIndex = 2 (5-1) => step=4
    //    nb comparaisons+1 => 2, and 4 <> 12/2 NO !
    // stepIndex = 3 (7-1) => step=6
    //    nb comparaisons+1 => 2, and 6 = 12/2 YES !

    expect(Stabilizer.getCycleStep([3,5,11])).toEqual({step:0, stepIndex:0})
    // if right to left (11-5) = 6 Match !

    // so inverse argument, then the logic of getCycleStep works differently,
    // accept that only somme first elements match (from left to right on elements inverse sorted)
    expect(Stabilizer.getCycleStep([11,5,3])).toEqual({step:6, stepIndex:1})

    // with "CM1-T1~6* CM1-T3 CM1-T5 CM1-T11"
    // const expected5       = "CM1-T1~6* CM1-T3 CM1-T5 CM1-T11"
    // const expected5Better = "CM1-T1~6* CM1-T3 CM1-T5~6*"  <===== YES

    //reduce steps 0,1,2,4,5,7,8,10,11 -> 1,4,7,10 (indexStep = 2)
    //reduce steps 0,1,2,4,5,7,8,10,11 -> 1,2,5,7,10,11 (indexStep = 3)
    // const steps = [0,1,2,4,5,7,8,10,11]
    // console.log(steps.filter((k, index) => (index % 3 !== 0)))

  })

  //
  // it("isInclude", () => {
  //   const group = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
  //   const stab = group.orbitsSortedGroupedByStabilizer[2].orbits[2].stabilizers[0]
  //
  //   const stabStr = group.orbitsSortedGroupedByStabilizer[2].orbits[2].stabilizers[0].toString()
  //
  //   expect(stabStr).toEqual('Stab: M1-T0,CM11-T11 #FixedPcs: 12')
  //
  //   let opId = new MusaicOperation(12, 1, 0)
  //   let opCM11T11 = new MusaicOperation(12, 11, 11, true);
  //
  //   let opM11T11 = new MusaicOperation(12, 11, 11, false);
  //
  //   expect(stab.isInclude([opCM11T11])).toBe(true)
  //   expect(stab.isInclude([opId])).toBe(true)
  //   expect(stab.isInclude([opId, opCM11T11])).toBe(true)
  //   expect(stab.isInclude([opId, opCM11T11])).toBe(true)
  //   expect(stab.isInclude([opM11T11])).toBe(false)
  //   expect(stab.isInclude([opId, opM11T11])).toBe(false)
  // })

})
