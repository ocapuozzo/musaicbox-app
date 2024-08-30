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


  it("pcsList only in one stabilizer in this orbit", () => {
    let group = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)

    group.orbits.forEach((orbit) => {
      expect(orbit.stabilizers.length).toEqual(1)
    })

    group = GroupAction.predefinedGroupsActions(12, Group.DIHEDRAL)
    detectDuplicatePcs(group)

    group = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    detectDuplicatePcs(group)

  })

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
