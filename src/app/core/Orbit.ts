/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {IPcs} from "./IPcs";
// import {Utils} from "../utils/Utils"
import {MotifStabilizer} from "./MotifStabilizer";
import {Stabilizer} from "./Stabilizer";
import {GroupAction} from "./GroupAction";

export class Orbit {
  stabilizers : Stabilizer[]
  ipcsset : IPcs[] = []
  _hashcode ?: number
  motifStabilizer
  groupAction ?: GroupAction

  constructor(
    {stabs, ipcsSet} :
    {stabs ?: any[], ipcsSet ?:IPcs[]} = {}) {
    this.stabilizers = stabs ?? []
    this.ipcsset = ipcsSet ?? []
    this._hashcode = undefined
    this.motifStabilizer = MotifStabilizer.manyMotifsStabilizer
  }

  get cardinal() {
    return this.ipcsset.length
  }


  /**
   *
   * @param {IPcs} newIPcs
   */
  addIPcsIfNotPresent(newIPcs : IPcs) {
    if (!this.ipcsset.find(ipcs => ipcs.id === newIPcs.id)) {
      this.ipcsset.push(newIPcs)
      this._hashcode = undefined
    }
  }

  /**
   *
   * @param orbit1
   * @param orbit2
   * @return {number} as waiting by Array sort
   */
  static compare(orbit1 : Orbit, orbit2: Orbit) {
    let cmp = 0;
    orbit1.stabilizers.forEach(stab1 => {
      // @ts-ignore
      orbit2.stabilizers.forEach(stab2 => {
        cmp = stab1.compareTo(stab2);
        if (cmp !== 0) {
          return cmp;
        }
      });
    });

    if (cmp === 0) {
      cmp = orbit1.getPcsMin().compareTo(orbit2.getPcsMin());
    }
    return cmp;
  }


  /**
   *
   * @param orbit1
   * @param orbit2
   * @return {number} as waiting by Array sort
   */
  static comparePcsMin(orbit1: Orbit, orbit2: Orbit): number {
      return orbit1.getPcsMin().compareTo(orbit2.getPcsMin());
  }


  /**
   * rem : this.ipcsset is sorted
   * @return {IPcs} the min IPcs of elements of orbit (min elt in ipcsset)
   */
  getPcsMin(): IPcs {
    if (this.ipcsset.length === 0)
      throw new Error("Orbit : get min on empty set");
    return this.ipcsset[0];
  }

  toString() {
    return "Orbit (" + this.ipcsset.length + ") stabilizers=" + this.stabilizers
      + " ipcsset : " + this.ipcsset + "  min = " + this.getPcsMin().toString();
  }

  hashCode() {
    if (!this._hashcode) {
      let res = 0
      this.stabilizers.forEach(stab => res += stab.hashCode())
      this.ipcsset.forEach(pcs => res += pcs.id)
      this._hashcode = res //Utils.stringHashCode(this.toString())
    }
    return this._hashcode
  }

  /**
   * get symmetric minimum (experimental)
   *
   * @return
   *
   public Pcs getMinSym() {
  if (minSymmetric == null) {
    List<Pcs> cyclicPcs =  Arrays.asList(getMin().getPcsCyclicTransf());
    Collections.sort(cyclicPcs, new PcsSymmetryComparator());
    minSymmetric = cyclicPcs.get(0);
  }
  return minSymmetric;
}

  /**
   * Based on stabilizers and their shortName
   *
   * @return {string}
   */
  get name() {
    let res = ""
    this.stabilizers.forEach(stab => res += " " + stab.getShortName())
    return res
  }

  /**
   * compute ISMotif stabilizer from orbit's stabilizers
   * example :
   *   stabilizers 1 :  M1-T0,M5-T8,M7-T9,M11-T5
   *   stabilizers 2 :  M1-T0,M5-T4,M7-T3,M11-T7
   *   motif stab => M1, M5, M7, M11  (invariant ISMotif by M1, M5, M7, M11)
   *   without worrying about transposition Tx
   *
   *   @return {MotifStabilizer} the motifStabilizer of this orbit
   */
  checkAndBuildMotifStabilizerOfOrbit() {
    let motifStabilizersOfOrbit = new Map() // key hashCode, value MotifStabilizer object
    this.stabilizers.forEach(stab => motifStabilizersOfOrbit.set(stab.motifStabilizer.hashCode(), stab.motifStabilizer))

    this.motifStabilizer = (motifStabilizersOfOrbit.size === 1)
      ? this.stabilizers[0].motifStabilizer  // take any, we choice first
      : MotifStabilizer.manyMotifsStabilizer // *

    return this.motifStabilizer
  }

  /**
   * return true if stabilizers include relationship equivalence to nearest transposition
   * @return {Boolean}
   */
  get isMotifEquivalence() : boolean {
    return this.stabilizers.some(stab => stab.isMotifEquivalence)
  }

  get empty() {
    return this.ipcsset.length == 0
  }

}
