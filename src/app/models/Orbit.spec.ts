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
// import { fail } from "assert";
import {Stabilizer} from "./Stabilizer";
import {MusaicPcsOperation} from "./MusaicPcsOperation";

describe('Orbit', () => {
  it("Constructor default", () => {
    let orbit = new Orbit();
    expect(orbit.ipcsset).not.toBeNull()
    expect(orbit.stabilizers).not.toBeNull()
  });

  it("Orbit isMotifEquivalence", () => {
    let orbit = new Orbit();
    let stab = new Stabilizer()
    stab.addOperation(new MusaicPcsOperation(12, 1, 0))
    orbit.stabilizers.push(stab)
    expect(orbit.isMotifEquivalence).not.toBeTruthy()
    stab.addOperation(new MusaicPcsOperation(12, 1, 1))
    expect(orbit.isMotifEquivalence).toBeTruthy()
  });

})
