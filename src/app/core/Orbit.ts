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
import {MetaStabilizer} from "./MetaStabilizer";
import {Stabilizer} from "./Stabilizer";
import {GroupAction} from "./GroupAction";
import {PcsUtils} from "../utils/PcsUtils";
import {MusaicOperation} from "./MusaicOperation";


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
   *   detached of a group action => groupAction is undefined and this.comingFromOrbit is false
   *   attached of a group action => groupAction ref an instance of GroupAction and this.comingFromOrbit is true
   *
   * IPcs is coming from orbit (or not)
   */
  groupAction ?: GroupAction = undefined

  /**
   * @see finalizeStateByBuildMetaStabilizer
   */
  metaStabilizer: MetaStabilizer  // stab without Tx

  _hashcode ?: number

  _reducedStabilizersName: string

  /**
   * Stabilizer name, by reduction
   * Example (Musaic n° 84) : M1-T0 M7-T3~6* CM5-T2~4* CM11-T1~2*
   * @return {string}
   */
  get reducedStabilizersName(): string {
    if (!this._reducedStabilizersName) {
      return this.buildReducedStabilizersName(this.stabilizers);
    }
    return this._reducedStabilizersName
  }

  constructor(
    {stabs, ipcsSet}:
    { stabs?: Stabilizer[], ipcsSet?: IPcs[] } = {}) {
    this.stabilizers = stabs ?? []
    this.ipcsset = ipcsSet ?? []
    this._hashcode = undefined


    // will be re-instantiated by finalizeStateByBuildMetaStabilizer()
    // when group action
    this.metaStabilizer = MetaStabilizer.nullMetaStabilizer

    // this.buildStabilizersSignatureName() no, don't do it here !

    // orbit is not an immutable class. During the GroupAction constructor,
    // the orbit instance changes state until the orbit construction is complete.
    // When it's done, the GroupAction constructor calls this.finalizeStateMetaStabilizer()
    // and, only then, does the orbit become immutable.
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
   * @return {number} as expected by Array sort
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

    if (cmp === 0 && orbit1.isComingFromGroupAction() && orbit2.isComingFromGroupAction()) {
      cmp = orbit1.getPcsMin().compareTo(orbit2.getPcsMin());
    }
    return cmp;
  }

  /**
   *
   * @param orbit1
   * @param orbit2
   * @return {number} as expected by Array sort
   */
  static comparePcsMin(orbit1: Orbit, orbit2: Orbit): number {
    return orbit1.getPcsMin().compareTo(orbit2.getPcsMin());
  }


  /**
   * rem : this.ipcsset is sorted
   * @return {IPcs} the min IPcs of elements of orbit (min elt in ipcsset)
   */
  getPcsMin(): IPcs {
    if (! this.isComingFromGroupAction())
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
      this._hashcode = res //StringHash.stringHashCode(this.toString())
    }
    return this._hashcode
  }


  getAllStabilizersName() : string {
     const ops = this.stabilizers.flatMap(stab => stab.operations)
     return [...new Set(ops)].sort(MusaicOperation.compare).join(" ")
  }

  /**
   * Create a reduced stabilizer name of this orbit
   * Example :
   *   stabilizers of Musaic n° 84 (24 pcs in orbit) :
   *     M1-T0 M7-T9 CM5-T10 CM11-T7 (4)
   *     M1-T0 M7-T3 CM5-T10 CM11-T1 (4)
   *     M1-T0 M7-T3 CM5-T6 CM11-T9 (3)
   *     M1-T0 M7-T9 CM5-T6 CM11-T3 (3)
   *     M1-T0 M7-T9 CM5-T2 CM11-T11 (5)
   *     M1-T0 M7-T3 CM5-T2 CM11-T5 (5)
   *
   *  reduced stabilizer name is : M1-T0 M7-T3~6* CM5-T2~4* CM11-T1~2*
   *
   * @private
   */
  private buildReducedStabilizersName(stabilizers : Stabilizer[]) {

    // get in one list (flatmap) all operations in string representation, reduced name by stabilizer if possible.
    let firstTryReducedStabName = Array.from(stabilizers.flatMap(stab => stab.getShortName().split(' ')))

    // get all reduced name, as M1-T0~1* (first index of * is 7)
    let firstReducedNameOps = firstTryReducedStabName.filter(op => op.indexOf("*") > 6)

    // get only remaining operation that have not been reduced yet
    let remainingOpsNotReduce = firstTryReducedStabName.filter(op => firstReducedNameOps.indexOf(op) === -1)

    // no duplication and sorted
    remainingOpsNotReduce  = [...new Set([...remainingOpsNotReduce])].sort(PcsUtils.compareOpCMaTkReducedOrNot)

    // === try to reduce renaming operations list ===
    // for make instance of Stabilizer we must have instances of MusaicOperation
    const operationsRemaining =
      MusaicOperation.convertArrayStringsToArrayOfMusaicOperations(
        this.groupAction ? this.groupAction.n : 12, remainingOpsNotReduce)

    // now make instance of Stabilize, and put it into an array (length = 1)
    let newStabilizers = [new Stabilizer({operations: operationsRemaining})]

    // Let's try a second time to call stab.getShortName()
    let lastTryReducedStabName = Array.from(newStabilizers.flatMap(stab => stab.getShortName().split(' ')))

    // now merge the two lists (and remove duplications if they exist, via Set structure)
    let result : string[]
    // if lastTryReducedStabName === [''], then ignore it
    if (lastTryReducedStabName.length === 1 && lastTryReducedStabName[0].length === 0) {
      result  = [...new Set([...firstReducedNameOps])]
    } else {
      // lastTryReducedStabName.length > 1
      result  = [...new Set([...firstReducedNameOps,...lastTryReducedStabName])]
    }

    // All that remains is to sort the list and transform it into a string
    return result.sort(PcsUtils.compareOpCMaTkReducedOrNot).join(' ')
  }

  /**
   * Only one call, by GroupAction constructor when this orbit is complete
   *
   */
  finalizeStateMetaStabilizer() {
    this.metaStabilizer = this.finalizeStateByBuildMetaStabilizer()
  }

    /**
   * compute ISMotif stabilizer from orbit's stabilizers
   * example n=12 :
   *   stabilizers 1 :  M1-T0,M5-T8,M7-T9,M11-T5
   *   stabilizers 2 :  M1-T0,M5-T4,M7-T3,M11-T7
   *
   *   same motif stab => M1, M5, M7, M11  (invariant ISMotif by M1, M5, M7, M11)
   *   without worrying about transposition Tx
   *
   * Only one call, by GroupAction constructor when this orbit is complete
   *
   *   @return {MetaStabilizer} the strMetaStabilizer of this orbit
   */
  finalizeStateByBuildMetaStabilizer(): MetaStabilizer {
    const stabSignature = this.reducedStabilizersName

    // take left part of "M1-T0 CM11-Tk~step" => "M1 CM11"
    const signatureWithoutTranslation = stabSignature.split(" ").map(op => op.trim().split("-")[0]);

    // with delete duplicate values via Set
    return new MetaStabilizer([...new Set(signatureWithoutTranslation)].sort(PcsUtils.compareOpCMaWithoutTk).join(" "))
  }

  /**
   * return true if stabilizers include relationship equivalence to nearest transposition (M1-T1)
   * @return {Boolean}
   */
  get isMotifEquivalence(): boolean {
    return this.stabilizers.some(stab => stab.isMotifEquivalence)
  }

  isComingFromGroupAction(): boolean {
    return this.groupAction !== undefined
  }

  has(pcs: IPcs): boolean {
    return this.ipcsset.find(p => p.id == pcs.id) !== undefined
  }

  getPcsWithThisIS(intervallicStructure: string): IPcs | undefined {
    return this.ipcsset.find(p => p.is().toString() === intervallicStructure)
  }

  getPcsWithThisPid(pid: number) {
    return this.ipcsset.find(p => p.pid() === pid)
  }

  getPcsWithThisId(id: number) {
    return this.ipcsset.find(p => p.id === id)
  }

}
