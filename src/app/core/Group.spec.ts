/*
 * Copyright (c) 2019. Olivier Capuozzo
 */

import {MusaicOperation} from "./MusaicOperation";
import {IPcs} from "./IPcs";
import {Group} from "./Group";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

const getRandomInt = (max: number)  => {
 return Math.floor(Math.random() * Math.floor(max))
}

describe('Group', () => {
  it("Trivial group Generator group from M1T0", () => {
    let opM1_T0 = new MusaicOperation(12, 1, 0, false);
    let someOps = [opM1_T0]
    let opsExpected = someOps
    let allOps = Group.buildOperationsGroupByCayleyTable(someOps)
    expect(1).toEqual(opsExpected.length)
    expect(allOps).toEqual(opsExpected)
    expect(allOps.length).toEqual(1)
  })

  it("Generator group from M1-T1 (cyclic)", () => {
    let opM1_T1 = new MusaicOperation(12, 1, 1, false);
    let someOps = [opM1_T1]
    let opsExpected: MusaicOperation[] = []

    let allOperations = Group.buildOperationsGroupByCayleyTable(someOps)

    expect(allOperations.length).toEqual(12)
    for (let i = 0; i < 12; i++) {
      opsExpected.push(new MusaicOperation(12, 1, i, false))
    }
    expect(allOperations.length).toEqual(12)
    expect(allOperations).toEqual(opsExpected)
  })


  it("Generator group from M1-T1 and M5-T1", () => {
    let opM1_T1 = new MusaicOperation(12, 1, 1, false);
    let someOps = [opM1_T1]
    let opsExpected: MusaicOperation[] = []
    for (let i = 0; i < 12; i++) {
      opsExpected.push(new MusaicOperation(12, 1, i, false))
    }
    let allOperations = Group.buildOperationsGroupByCayleyTable(someOps)
    expect(allOperations.length).toEqual(12)
    expect(allOperations).toEqual(opsExpected)

    let opM5_T1 = new MusaicOperation(12, 5, 1, false);
    someOps.push(opM5_T1)
    expect(Group.buildOperationsGroupByCayleyTable(someOps).length).toEqual(24)
  })

  it("testCayleyGenerateOperationsAffine", () => {
    let someOperations: MusaicOperation[] = []
    let order = 12;
    let a = 1;
    let t = 1;
    let complement = false;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    a = 5;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    a = 7;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    a = 11;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    const allOperations = Group.buildOperationsGroupByCayleyTable(someOperations)
    // generate 48 operations : 12 * each a
    expect(allOperations.length).toEqual(order * 4)

    // for (let i = 0; i < allOperations.length ; i++) {
    //   console.log(allOperations[i].toString())
    // }
  })

  it("testCayleyGenerateOperationsMusaic", () => {
    let someOperations: MusaicOperation[] = []
    let order = 12;
    let a = 1;
    let t = 1;
    let complement = false;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    a = 5;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    a = 7;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    complement = true;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    t = getRandomInt(12)
    let aleaOp = new MusaicOperation(order, 11, t, complement)

    let allOps = Group.buildOperationsGroupByCayleyTable(someOperations)

    // test if aleaOp is in allOps
    expect(allOps.find((op) => op.getHashCode() === aleaOp.getHashCode())).toBeTruthy()

    // expected 96 operations : 12 * each a = 48 and each complement (*2)
    expect(allOps.length).toEqual(order * 4 * 2)
  })


  it("testCayleySubGroupM1_M7_CM5_CM11", () => {
    let someOperations: MusaicOperation[] = []
    let order = 12;
    let a = 1;
    let t = 1;
    let complement = false;

    // M1
    someOperations.push(new MusaicOperation(order, a, t, complement));

    // M7
    a = 7;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    // CM5
    a = 5;
    complement = true;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    // CM11
    a = 11;
    complement = true;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    let allOps = Group.buildOperationsGroupByCayleyTable(someOperations)

    // expected 48 operations : 12 * 4 (no CM7 ans CM1 generated)
    expect(allOps.length).toEqual(12 * 4)
  })


  it("testCayleySubGroupM1_M2 with n=7", () => {
    let someOperations: MusaicOperation[] = []
    let order = 7;
    let a = 1;
    let t = 1;
    let complement = false;

    // M1
    someOperations.push(new MusaicOperation(order, a, t, complement));

    // M2
    a = 2;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    let allOps = Group.buildOperationsGroupByCayleyTable(someOperations)

    // expected 42 operations : 7 * 6 ([M1 M2 M3 M4 M5 M6).length
    expect(allOps.length).toEqual(7 * 6)

    // CM1
    a = 1;
    complement = true
    someOperations.push(new MusaicOperation(order, a, t, complement));

    allOps = Group.buildOperationsGroupByCayleyTable(someOperations)

    // allOps.forEach(op => console.log(op.toString()))

    // expected 84 operations : 7 * 12 ([M1 M2 M3 M4 M5 M6 CM1 CM2 CM3 CM4 CM5 CM6].length)
    expect(allOps.length).toEqual(7 * 12)
  })



  // M1, M7, CM5, CM11

  it("Group buildOrbit", () => {
    let someOperations: MusaicOperation[] = []
    let order = 12;
    let a = 1;
    let t = 1;
    let complement = false;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    a = 5;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    a = 7;
    someOperations.push(new MusaicOperation(order, a, t, complement));
    complement = true;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    let group = new Group(someOperations)

    // expected 96 operations : 12 * each a = 48 and each complement (*2)
    expect(group.operations.length).toEqual(order * 4 * 2)

    let ipcs = new IPcs({pidVal: 0, n: 12})
    ipcs = group.buildOrbitOf(ipcs)
    expect(ipcs.orbit.cardinal).toEqual(2)

    let ipcs_dim = new IPcs({strPcs: "0, 3, 6, 9"})
    ipcs_dim = group.buildOrbitOf(ipcs_dim)
    expect(ipcs_dim.orbit.cardinal).toEqual(6)

  })

  it("phiEulerElements", () => {
    expect(Group.phiEulerElementsOf(12)).toEqual([1,5,7,11])
    expect(Group.phiEulerElementsOf(7)).toEqual([1,2,3,4,5,6])
    expect(Group.phiEulerElementsOf(5)).not.toEqual([1,2,3,4,5,6])
    expect(Group.phiEulerElementsOf(5)).toEqual([1,2,3,4])
  })


  it("Test Group M5 M7 Complement without Translation", () => {
    let someOperations: MusaicOperation[] = []
    let order = 12;
    let a = 1;
    let t = 0;
    let complement = false;
    // neutral op
    someOperations.push(new MusaicOperation(order, a, t, complement));

    a = 5;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    a = 7;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    a = 1
    complement = true;
    someOperations.push(new MusaicOperation(order, a, t, complement));

    let group = new Group(someOperations)

    // expected 96 operations : 12 * each a = 48 and each complement (*2)
    expect(group.operations.length).toEqual(4 * 2)
    //
    // let ipcs = new IPcs({pidVal: 0, n: 12})
    // ipcs = group.buildOrbitOf(ipcs)
    // expect(ipcs.orbit.cardinal).toEqual(2)
    //
    // let ipcs_dim = new IPcs({strPcs: "0, 3, 6, 9"})
    // ipcs_dim = group.buildOrbitOf(ipcs_dim)
    // expect(ipcs_dim.orbit.cardinal).toEqual(6)

  })

 it("group name", () => {
   const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!.group
   expect(groupCyclic.name).toEqual("n=12 [M1]")

   const groupMusaic =  ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!.group
   expect(groupMusaic.name).toEqual("n=12 [M1 M5 M7 M11 CM1 CM5 CM7 CM11]")

 })
})
