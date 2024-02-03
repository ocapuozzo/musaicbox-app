/*
 * Copyright (c) 2019. Olivier Capuozzo
 */

import {MusaicPcsOperation} from "./MusaicPcsOperation";
import {IPcs} from "./IPcs";
import {Group} from "./Group";

const getRandomInt = (max: number)  => {
 return Math.floor(Math.random() * Math.floor(max))
}

describe('Group', () => {
  it("Generator group from M1T0", () => {
    let opM1_T0 = new MusaicPcsOperation(12, 1, 0, false);
    let someOps = [opM1_T0]
    let opsWaiting = someOps
    let allOps = Group.buildOperationsGroupByCaylayTable(someOps)
    expect(allOps).toEqual(opsWaiting)
  })

  it("Generator group from M1T1", () => {
    let opM1_T1 = new MusaicPcsOperation(12, 1, 1, false);
    let someOps = [opM1_T1]
    let opsWaiting: MusaicPcsOperation[] = []
    for (let i = 0; i < 12; i++) {
      opsWaiting.push(new MusaicPcsOperation(12, 1, i, false))
    }
    let allOperations = Group.buildOperationsGroupByCaylayTable(someOps)
    expect(allOperations).toEqual(opsWaiting)
  })

  it("Predefined Cyclic Group", () => {
    let cyclicGroup = Group.predefinedGroups[Group.CYCLIC]
    expect(cyclicGroup.operations.length).toEqual(12)
  })


  it("testCayleyGenerateOperationsAffine", () => {
    let someOperations: MusaicPcsOperation[] = []
    let order = 12;
    let a = 1;
    let t = 1;
    let complement = false;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    a = 5;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    a = 7;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    a = 11;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));

    // generate 48 operations : 12 * each a
    expect(Group.buildOperationsGroupByCaylayTable(someOperations).length).toEqual(order * 4)
  })

  it("testCayleyGenerateOperationsMusaic", () => {
    let someOperations: MusaicPcsOperation[] = []
    let order = 12;
    let a = 1;
    let t = 1;
    let complement = false;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    a = 5;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    a = 7;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    complement = true;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));

    t = getRandomInt(12)
    let aleaOp = new MusaicPcsOperation(order, 11, t, complement)

    let allOps = Group.buildOperationsGroupByCaylayTable(someOperations)

    // test if aleaOp is in allOps
    expect(allOps.find((e) => e.getHashCode() === aleaOp.getHashCode())).toBeTruthy()

    // waiting 96 operations : 12 * each a = 48 and each complement (*2)
    expect(allOps.length).toEqual(order * 4 * 2)
  })


  it("Group buildOrbit", () => {
    let someOperations: MusaicPcsOperation[] = []
    let order = 12;
    let a = 1;
    let t = 1;
    let complement = false;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    a = 5;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    a = 7;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));
    complement = true;
    someOperations.push(new MusaicPcsOperation(order, a, t, complement));

    let group = new Group(someOperations)

    // waiting 96 operations : 12 * each a = 48 and each complement (*2)
    expect(group.operations.length).toEqual(order * 4 * 2)

    let ipcs = new IPcs({pidVal: 0, n: 12})
    ipcs = group.buildOrbitOf(ipcs)
    expect(ipcs.orbit.cardinal).toEqual(2)

    let ipcs_dim = new IPcs({strPcs: "0, 3, 6, 9"})
    ipcs_dim = group.buildOrbitOf(ipcs_dim)
    expect(ipcs_dim.orbit.cardinal).toEqual(6)

  })

  it("Group buildOrbit by predefined groups ", () => {
    let ipcs = new IPcs({pidVal: 0, n: 12})
    ipcs = Group.predefinedGroups[Group.MUSAIC].buildOrbitOf(ipcs)
    expect(ipcs.orbit.cardinal).toEqual(2)

    let ipcs_dim = new IPcs({strPcs: "0, 3, 6, 9"})
    ipcs_dim = Group.predefinedGroups[Group.MUSAIC].buildOrbitOf(ipcs_dim)
    expect(ipcs_dim.orbit.cardinal).toEqual(6)

    expect(Group.predefinedGroups[Group.MUSAIC].operations.length).toEqual(96)
  })


  it("phiEulerElements", () => {
    expect(Group.phiEulerElements(12)).toEqual([1,5,7,11])
    expect(Group.phiEulerElements(7)).toEqual([1,2,3,4,5,6])
    expect(Group.phiEulerElements(5)).not.toEqual([1,2,3,4,5,6])
  })


})
