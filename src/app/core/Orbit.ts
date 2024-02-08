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
import {MotifStabilizer} from "./MotifStabilizer";
import {Stabilizer} from "./Stabilizer";
import {GroupAction} from "./GroupAction";

export class Orbit {
  /**
   * stabilizers of this orbit
   */
  stabilizers: Stabilizer[]

  /**
   * Ipcs set as subset of powerset
   */
  ipcsset: IPcs[]

  /**
   * This orbit can be in two states :
   *   detached of a group action => groupAction is undefined and this.detached is true
   *   attached of a group action => groupAction ref an instance of GroupAction and this.detached is NOT true
   *
   * IPcs is detached (or not) of a GroupAction if this.orbit is detached or if this.groupAction is undefined
   * @see methode isDetached()
   */
  groupAction ?: GroupAction = undefined

  /**
   * @see checkAndBuildMotifStabilizerOfOrbit
   */
  motifStabilizer: MotifStabilizer  // stab without Tx

  _hashcode ?: number

  constructor(
    {stabs, ipcsSet}:
      { stabs?: Stabilizer[], ipcsSet?: IPcs[] } = {}) {
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
  addIPcsIfNotPresent(newIPcs: IPcs) {
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
  static compare(orbit1: Orbit, orbit2: Orbit): number {
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

    if (cmp === 0 && !orbit1.isDetached() && !orbit2.isDetached()) {
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
    if (this.isDetached())
      throw new Error("Orbit : impossible get min on detached orbit");
    return this.ipcsset[0];
  }

  toString() {
    const endLine = (this.ipcsset.length > 0) ? '  min =  ' + this.getPcsMin().toString() : ''
    return "Orbit ("
      + this.ipcsset.length + ") stabilizers.length:"
      + this.stabilizers.length
      + " ipcsset.length:"
      + this.ipcsset.length
      + endLine

  }

  hashCode() {
    if (this._hashcode == undefined) {
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
    this.stabilizers.forEach(stab => res = res ? " " + stab.getShortName() : stab.getShortName())
    return res
  }

  /**
   * compute ISMotif stabilizer from orbit's stabilizers
   * example n=12 :
   *   stabilizers 1 :  M1-T0,M5-T8,M7-T9,M11-T5
   *   stabilizers 2 :  M1-T0,M5-T4,M7-T3,M11-T7
   *   motif stab => M1, M5, M7, M11  (invariant ISMotif by M1, M5, M7, M11)
   *   without worrying about transposition Tx
   *
   * Only one call, by GroupAction constructor when this orbit is complete
   *
   *   @return {MotifStabilizer} the motifStabilizer of this orbit
   */
  checkAndBuildMotifStabilizerOfOrbit(): MotifStabilizer {
    let motifStabilizersOfOrbit = new Map<number, MotifStabilizer>() // key hashCode
    this.stabilizers.forEach(
      stab => motifStabilizersOfOrbit.set(stab.motifStabilizer.hashCode(), stab.motifStabilizer)
    )

    this.motifStabilizer = (motifStabilizersOfOrbit.size === 1)
      ? this.stabilizers[0].motifStabilizer  // take any, we choose first
      : MotifStabilizer.manyMotifsStabilizer // *

    return this.motifStabilizer
  }

  /**
   * return true if stabilizers include relationship equivalence to nearest transposition (M1-T1)
   * @return {Boolean}
   */
  get isMotifEquivalence(): boolean {
    return this.stabilizers.some(stab => stab.isMotifEquivalence)
  }

  isDetached(): boolean {
    return this.groupAction == undefined // this.ipcsset.length == 0
  }

}
