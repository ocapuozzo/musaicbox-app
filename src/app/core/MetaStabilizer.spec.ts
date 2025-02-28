/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {MetaStabilizer} from "./MetaStabilizer";
import {IPcs} from "./IPcs";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

describe('MetaStabilizer', () => {
  it("MetaStabilizer Constructor", () => {
    let metaStab = new MetaStabilizer("M1, M5");
    expect(metaStab.metaStabOperations).not.toBeNull()
    expect(metaStab.metaStabOperations).toEqual(["M1", "M5"])
  });

  it("MetaStabilizer toString", () => {
    let metaStab = new MetaStabilizer("M1, M5");
    expect(metaStab.toString()).toEqual("M1, M5")
  });

  it("MetaStabilizer getMiniName", () => {
    let metaStab = new MetaStabilizer("M1, M5, M7, M11, CM1, CM5, CM7, CM11");
    expect(metaStab.getMiniName()).toEqual("M1, M5, M7,...")
  });

  it("MetaStabilizer equals hashCode", () => {
    let metaStab1 = new MetaStabilizer("M1, M5, M7");
    let metaStab2 = new MetaStabilizer("M1, M5, M7");
    let metaStab3 = new MetaStabilizer("M1, M5, M7, CM1");
    expect(metaStab1.equals(metaStab2)).toBeTruthy()
    expect(metaStab1.hashCode()).toEqual(metaStab2.hashCode())
    expect(metaStab1.equals(metaStab3)).not.toBeTruthy()
    expect(metaStab1.hashCode()).not.toEqual(metaStab3.hashCode())
  });


  it("MetaStabilizer sort compare", () => {
    let metaStab1 = new MetaStabilizer("M1, M5, M7");
    let metaStab2 = new MetaStabilizer("M1, M7, CM5");
    let metaStab3 = new MetaStabilizer("M1, M5, CM1, CM7");
    let metaStab4 = new MetaStabilizer("CM1");
    let metaStab5 = new MetaStabilizer("M1, CM1");
    let metaStab6 = new MetaStabilizer("M1, M5, CM1, CM9");
    let stabilizers = [metaStab1, metaStab2, metaStab3, metaStab6, metaStab4, metaStab5]

    // waiting
    // "CM1"            (stab4)
    // "M1 CM1"         (stab5)
    // "M1 M5 M7"       (stab1)
    // "M1 M7 CM5"      (stab2)
    // "M1 M5 CM1 CM7"  (stab3)
    // "M1 M5 CM1 CM9"  (stab6)
    stabilizers.sort(MetaStabilizer.compare)

    expect(stabilizers[0]).toEqual(metaStab4)
    expect(stabilizers[1]).toEqual(metaStab5)
    expect(stabilizers[2]).toEqual(metaStab1)
    expect(stabilizers[3]).toEqual(metaStab2)
    expect(stabilizers[4]).toEqual(metaStab3)
    expect(stabilizers[5]).toEqual(metaStab6)
  });

  it("equals hashCode", () => {
    let metaStab1 = new MetaStabilizer("M1, M5, M7");
    let metaStab2 = new MetaStabilizer("M1, M5, M7");
    let metaStab3 = new MetaStabilizer("M1, M5, M7, CM1");
    expect(metaStab1.equals(metaStab2)).toBeTruthy()
    expect(metaStab1.hashCode()).toEqual(metaStab2.hashCode())
    expect(metaStab1.equals(metaStab3)).not.toBeTruthy()
    expect(metaStab1.hashCode()).not.toEqual(metaStab3.hashCode())

    // same
    expect(metaStab1.equals(metaStab1)).toBeTruthy()

    // 42 is not good object !
    expect(metaStab1.equals(42)).not.toBeTruthy()
  });

  it("MetaStabilizer compare", () => {
    let metaStab1 = new MetaStabilizer("M1, M5");
    let metaStab2 = new MetaStabilizer("CM1, M5");
    expect(MetaStabilizer.compare(metaStab1, metaStab2)).toEqual(-1)

    metaStab1 = new MetaStabilizer("M1");
    metaStab2 = new MetaStabilizer("M7");
    expect(MetaStabilizer.compare(metaStab1, metaStab2) < 0).toBe(true)

    metaStab1 = new MetaStabilizer("M7");
    metaStab2 = new MetaStabilizer("M7");
    expect(MetaStabilizer.compare(metaStab1, metaStab2)).toEqual(0)
  });

  it("MetaStabilizer of pcs", () => {
    const pcsSource = new IPcs({strPcs:"[0,1,3,5,8,10]"})
    const pcs = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!.getIPcsInOrbit(pcsSource)
    let metaStabWaiting = new MetaStabilizer("M1 M11 CM1 CM11");

    expect(metaStabWaiting.toString()).toEqual(pcs!.orbit!.metaStabilizer!.toString())
    expect(metaStabWaiting.metaStabOperations.length).toEqual(4)
  });



})

