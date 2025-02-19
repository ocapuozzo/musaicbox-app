/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */


import {Orbit} from "./Orbit";
import {Stabilizer} from "./Stabilizer";
import {MusaicOperation} from "./MusaicOperation";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";
import {IPcs} from "./IPcs";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

describe('Orbit', () => {
  it("Constructor default", () => {
    let orbit = new Orbit();
    expect(orbit.ipcsset).not.toBeNull()
    expect(orbit.stabilizers).not.toBeNull()
  });

  it("Orbit isMotifEquivalence", () => {
    let orbit = new Orbit();
    let stab = new Stabilizer()
    orbit.stabilizers.push(stab)
    stab.addOperation(new MusaicOperation(12, 1, 0))
    expect(orbit.isMotifEquivalence).not.toBeTruthy()
    stab.addOperation(new MusaicOperation(12, 1, 1))
    expect(orbit.isMotifEquivalence).toBeTruthy()
  });

  it("Orbit detached or not", () => {
    let orbit = new Orbit();
    expect(orbit.isDetached()).toBe(true)

    let groupAction = GroupAction.predefinedGroupsActions(12, Group.DIHEDRAL)
    expect(groupAction.orbits[0].isDetached()).toBe(false)
  });

  it("compare equals orbits", () => {
    let orbit = new Orbit();
    let stab = new Stabilizer()
    orbit.stabilizers.push(stab)
    stab.addOperation(new MusaicOperation(12, 1, 0))
    stab.addOperation(new MusaicOperation(12, 1, 1))

    let orbit2 = new Orbit();
    let stab2 = new Stabilizer()
    orbit2.stabilizers.push(stab2)
    stab2.addOperation(new MusaicOperation(12, 1, 0))
    stab2.addOperation(new MusaicOperation(12, 1, 1))

    expect(Orbit.compare(orbit, orbit2)).toEqual(0)
  })


  it("compare not equals orbits", () => {
    let orbit = new Orbit();
    let stab = new Stabilizer()
    orbit.stabilizers.push(stab)
    stab.addOperation(new MusaicOperation(12, 1, 0))
    stab.addOperation(new MusaicOperation(12, 1, 1))

    let orbit2 = new Orbit();
    let stab2 = new Stabilizer()
    orbit2.stabilizers.push(stab2)
    stab2.addOperation(new MusaicOperation(12, 1, 0))
    stab2.addOperation(new MusaicOperation(12, 1, 2)) // t1 < t2

    expect(Orbit.compare(orbit, orbit2)).toBeLessThan(0)
  })

  it("Possible getMin() on attached orbit", () => {
    let secondOrbit = GroupAction.predefinedGroupsActions(12, Group.DIHEDRAL).orbits[1]
    try {
      let ipcs: IPcs = secondOrbit.getPcsMin()
      expect(ipcs.getPcsStr()).toEqual('[0]')
    } catch (e: any) {
      fail('Waiting possible getMin() on not detached orbit')
    }
  })

  it("Impossible getMin() on detached orbit", () => {
    let orbit = new Orbit();
    try {
      let ipcs = orbit.getPcsMin()
      fail('impossible getMin() on detached orbit')
    } catch (e: any) {
      expect(e.message).toContain('impossible get min on detached orbit')
    }
  })

  it("hashCode() on attached orbit", () => {
    let firstOrbit = GroupAction.predefinedGroupsActions(12, Group.CYCLIC).orbits[0]
    let ipcs: IPcs = firstOrbit.getPcsMin()

    expect(ipcs.getPcsStr()).toEqual('[]')
    expect(firstOrbit.ipcsset[0].id).toEqual(0) // id empty set = 0
    // one stab, so, is hashcode
    expect(firstOrbit.hashCode()).toEqual(firstOrbit.stabilizers[0].hashCode())
  })

  it("orbit stabilizer", () => {
    const dihedralGroupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName("Dihedral")
    let pcs = dihedralGroupAction?.getPcsWithThisPid(1755)
    expect(pcs).toBeTruthy()
  })

   it("getStep" , () => {
     const dihedralGroupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName("Dihedral")
     let pcs = dihedralGroupAction?.getPcsWithThisPid(1755)
     const orbit = pcs!.orbit
     //
     expect(orbit.getCycleStep([0,2,10]).step).toEqual(0)
     //
     expect(orbit.getCycleStep([1,4,7,10])).toEqual({step:3, stepIndex:1})
     // 3 = 12/ (nb comparaisons + 1) stepIndex = 1
     //
     expect(orbit.getCycleStep([1,4,7,10])).toEqual({step:3, stepIndex:1})
     // 3 = 12/ (nb comparaisons + 1) stepIndex = 1
     //
     expect(orbit.getCycleStep([2,5,8,11])).toEqual({step:3, stepIndex:1})
     // 3 = 12/ (nb comparaisons + 1) stepIndex = 1
     //
     expect(orbit.getCycleStep([1,2,4,5,7,8,10,11])).toEqual({step:3, stepIndex:2})
     // 3 = 12/ (nb comparaisons + 1 ) stepIndex = 2
     //
     expect(orbit.getCycleStep([1,5,7,11])).toEqual({step:6, stepIndex:2})
     // 6 = 12/(nb comparaisons + 1) stepIndex = 2
     //
     expect(orbit.getCycleStep([0,4,8])).toEqual({step:4, stepIndex:1})
     // 4 = 12/(nb comparaisons + 1) stepIndex = 1
     //
     expect(orbit.getCycleStep([0,4,6,8])).toEqual({step:6, stepIndex:2})
     // 6 = 12/(nb comparaisons + 1) stepIndex = 2

     expect(orbit.getCycleStep([1,3,5,7])).toEqual({step:0, stepIndex:0})
         // stepIndex = 1 (3-1, 5-3, 7-5) => step=2
         //   but nb comparaisons+1 => 4, and 2 <> 12/4 NO !
         // stepIndex = 2 (5-1) => step=4
         //    nb comparaisons+1 => 2, and 4 = 12/2 NO !

     //reduce steps 1,2,4,5,7,8,10,11 -> 2,5,8,11
     // steps = steps?.filter((k, index) => (index % 2 !== 0))
     // console.log(steps)

   })


  it("hashCode() on detached orbit", () => {
    let orbit = new Orbit();
    let stab = new Stabilizer()
    orbit.stabilizers.push(stab)
    stab.addOperation(new MusaicOperation(12, 1, 0))
    stab.addOperation(new MusaicOperation(12, 1, 1))

    expect(orbit.hashCode()).toEqual(orbit.stabilizers[0].hashCode())
  })

  it("toString() on attached orbit", () => {
    let firstOrbit = GroupAction.predefinedGroupsActions(12, Group.CYCLIC).orbits[0]
    // console.log(firstOrbit.toString())
    expect(firstOrbit.toString()).toContain('Orbit (1) stabilizers.length:1')
    let secondOrbit = GroupAction.predefinedGroupsActions(12, Group.CYCLIC).orbits[1]
    // console.log(secondOrbit.toString())
    expect(secondOrbit.toString()).toContain('Orbit (12) stabilizers.length:1')
  })

  it("toString() on detached orbit", () => {
    let orbit = new Orbit();
    expect(orbit.toString()).toContain('Orbit (0) stabilizers.length:0')
  })

  it("partition and orbits", () => {
    let groupAction = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)

    groupAction.orbits.forEach((orbit) => {
      expect(orbit.stabilizers.length).toEqual(1)
    })
    detectDuplicatePcs(groupAction)

    groupAction = GroupAction.predefinedGroupsActions(12, Group.DIHEDRAL)
    detectDuplicatePcs(groupAction)

    groupAction = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    detectDuplicatePcs(groupAction)

  })

  it('test if orbit.name (short stabilizer name based) is ok', () => {
     const GROUP_NAMES = [
       {name:'Cyclic', card:6},
       {name:'Dihedral', card:35},
       {name:'Affine', card:52},
       {name:'Musaic', card:27}]

    GROUP_NAMES.forEach(group => {
      const groupAction = ManagerGroupActionService.getGroupActionFromGroupAliasName(group.name)
      if (groupAction) {
        testOrbitNameFromShortStabilizer(groupAction, group.card)
      } else {
        fail(`${group.name} fail from ManagerGroupActionService`)
      }
    })

  })

  /**
   * test if orbit.name (short stabilizer name based) is ok from a groupAction
   * @param groupAction
   * @param waitingCardinal
   */
  function testOrbitNameFromShortStabilizer(groupAction : GroupAction, waitingCardinal : number){
      const nOrbits1 = groupAction.computeOrbitSortedGroupedByStabilizer(false).length
      const nOrbits2 = groupAction.computeOrbitSortedGroupedByStabilizer(true).length
      expect(nOrbits1).toEqual(waitingCardinal)
      expect(nOrbits1).toEqual(nOrbits2)
  }

  // test partition
  function detectDuplicatePcs(group : GroupAction) {
    for (let i = 0; i < group.orbits.length; i++) {
      for (let j = i + 1; j < group.orbits.length; j++) {
        group.orbits[j].stabilizers.forEach((stab) => {
          for (let k = 0; k < group.orbits[i].ipcsset.length; k++) {
            expect(!stab.fixedPcs.some(pcs => pcs.id == group.orbits[i].ipcsset[k].id))
          }
        })
      }
    }
  }

})
