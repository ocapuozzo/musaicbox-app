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
  it("Trivial group Generator group from M1T0", () => {
    let opM1_T0 = new MusaicPcsOperation(12, 1, 0, false);
    let someOps = [opM1_T0]
    let opsWaiting = someOps
    let allOps = Group.buildOperationsGroupByCaylayTable(someOps)
    expect(1).toEqual(opsWaiting.length)
    expect(allOps).toEqual(opsWaiting)
    expect(allOps.length).toEqual(1)
  })

  it("Generator group from M1-T1 (cyclic)", () => {
    let opM1_T1 = new MusaicPcsOperation(12, 1, 1, false);
    let someOps = [opM1_T1]
    let opsWaiting: MusaicPcsOperation[] = []

    let allOperations = Group.buildOperationsGroupByCaylayTable(someOps)

    expect(allOperations.length).toEqual(12)

    for (let i = 0; i < 12; i++) {
      opsWaiting.push(new MusaicPcsOperation(12, 1, i, false))
    }

    expect(allOperations.length).toEqual(12)
    expect(allOperations).toEqual(opsWaiting)

    //
    // let opM11_T1 = new MusaicPcsOperation(12, 11, 1, false);
    // someOps.push(opM11_T1)
    // allOperations = Group.buildOperationsGroupByCaylayTable(someOps)
    // for (let i = 0; i < allOperations.length ; i++) {
    //   console.log(allOperations[i].toString())
    // }
    // console.log("==================================================")
    //
    // let opM5_T1 = new MusaicPcsOperation(12, 5, 1, false);
    // someOps.push(opM5_T1)
    // allOperations = Group.buildOperationsGroupByCaylayTable(someOps)
    // for (let i = 0; i < allOperations.length ; i++) {
    //   console.log(allOperations[i].toString())
    // }
    // console.log("==================================================")
    //
    // let opCM5_T1 = new MusaicPcsOperation(12, 1, 1, true);
    // someOps.push(opCM5_T1)
    // allOperations = Group.buildOperationsGroupByCaylayTable(someOps)
    // for (let i = 0; i < allOperations.length ; i++) {
    //   console.log(allOperations[i].toString())
    // }
    //
    // console.log("nb op : " + allOperations.length)

  })


  it("Generator group from M1-T1 and M5-T1", () => {
    let opM1_T1 = new MusaicPcsOperation(12, 1, 1, false);
    let someOps = [opM1_T1]
    let opsWaiting: MusaicPcsOperation[] = []
    for (let i = 0; i < 12; i++) {
      opsWaiting.push(new MusaicPcsOperation(12, 1, i, false))
    }
    let allOperations = Group.buildOperationsGroupByCaylayTable(someOps)
    expect(allOperations.length).toEqual(12)
    expect(allOperations).toEqual(opsWaiting)

    let opM5_T1 = new MusaicPcsOperation(12, 5, 1, false);
    someOps.push(opM5_T1)
    expect(Group.buildOperationsGroupByCaylayTable(someOps).length).toEqual(24)
  })

  it("Predefined Cyclic Group", () => {
    let cyclicGroup = Group.predefinedGroups12[Group.CYCLIC]
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

    const allOperations = Group.buildOperationsGroupByCaylayTable(someOperations)
    // generate 48 operations : 12 * each a
    expect(allOperations.length).toEqual(order * 4)

    // for (let i = 0; i < allOperations.length ; i++) {
    //   console.log(allOperations[i].toString())
    // }
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
    expect(allOps.find((op) => op.getHashCode() === aleaOp.getHashCode())).toBeTruthy()

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
    ipcs = Group.predefinedGroups12[Group.MUSAIC].buildOrbitOf(ipcs)
    expect(ipcs.orbit.cardinal).toEqual(2)

    let ipcs_dim = new IPcs({strPcs: "0, 3, 6, 9"})
    ipcs_dim = Group.predefinedGroups12[Group.MUSAIC].buildOrbitOf(ipcs_dim)
    expect(ipcs_dim.orbit.cardinal).toEqual(6)

    expect(Group.predefinedGroups12[Group.MUSAIC].operations.length).toEqual(96)
  })

  it("phiEulerElements", () => {
    expect(Group.phiEulerElements(12)).toEqual([1,5,7,11])
    expect(Group.phiEulerElements(7)).toEqual([1,2,3,4,5,6])
    expect(Group.phiEulerElements(5)).not.toEqual([1,2,3,4,5,6])
  })

})
