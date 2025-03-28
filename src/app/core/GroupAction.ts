/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the MusaicBox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 *  This class implement a group action (from group theory) on powerset of a finite set Zn (Z/nZ)
 *
 *  Each element of powerset (elements are instances of IPcs) has an unique id (into its powerset)
 *  Powerset is partitioned in sub-sets naming orbits
 *  An orbit has, in other, as property a set of elements of powerset (some instances of IPcs), named ipcsset
 *
 *  Important : As PrimeForm concept builds (implemented) with concept of Orbit (min pcs of orbit), implementation
 *  of orbit in constructor of GroupAction must not refer to PrimeForm function.
 *
 *  Once GroupAction constructed, IPcs objects are immutable, expected iPivot property which
 *  not participated in id (business logic) of IPcs instance.
 */

import {IPcs} from "./IPcs";
import {Orbit} from "./Orbit";
import {Group} from "./Group";
import {Stabilizer} from "./Stabilizer";
import {MusaicOperation} from "./MusaicOperation";
import {StringHash} from "../utils/StringHash";
import {ISortedOrbits} from "./ISortedOrbits";
import {MetaStabilizer} from "./MetaStabilizer";

export class GroupAction {
  n: number = -1;
  group: Group;
  operations: MusaicOperation[];
  // min operation = neutral operation = operations.get(0)

  powerset: Map<number, IPcs>

  orbits: Orbit[];

  operationsNameWithoutTxStr: string

  private _orbitsSortedGroupedByStabilizer ?: ISortedOrbits[];
  private _orbitsSortedGroupedByMetaStabilizer ?: ISortedOrbits[];
  private _orbitsSortedGroupedByCardinal ?: ISortedOrbits[];

  constructor(
    {n, someMusaicOperations, group}:
      { n?: number, someMusaicOperations?: MusaicOperation[], group?: Group } = {}) {
    if (group) {
      this.group = group
      this.n = group.operations[0].n
    } else {
      this.n = n ?? (someMusaicOperations ? someMusaicOperations[0].n : 12);
      this.group = new Group(someMusaicOperations ?? [new MusaicOperation(this.n, 1, 0)]);
    }
    // this.group = new Group(someMusaicOperations ?? []);
    this.operations = this.group.operations;
    // min operation = neutral operation = operations.get(0)
    this.powerset = GroupAction.buildPowerSetOfIPcs(this.n);
    this.orbits = this.buildOrbitsByActionOnPowerset();

    this._orbitsSortedGroupedByStabilizer = undefined
    this._orbitsSortedGroupedByMetaStabilizer = undefined
    this._orbitsSortedGroupedByCardinal = undefined

    this.buildOrbitMetaStabilizers()
    // build operations name without Tx
    this.operationsNameWithoutTxStr = this.buildOpNameWithoutTxToString()
  }

  /**
   *
   * generic algorithm to compute all subsets (IPcs) of Z/nZ
   *
   * @param {number} n
   *
   * @return {Map<number, IPcs>}
   */
  static buildPowerSetOfIPcs(n: number): Map<number, IPcs> {
    let cardinal = Math.pow(2, n);
    let powerset = new Map<number, IPcs>()
    let ipcs;
    for (let i = 0; i < cardinal; i++) {
      ipcs = new IPcs({pidVal: i, n: n});
      powerset.set(ipcs.id, ipcs)
    }
    return powerset;
  }

  /**
   * pre-assert : powerset sorted
   *
   * @return {Array} of Orbit of powerset by action of group operations on them
   *         (partition of powerset)
   *
   */
  private buildOrbitsByActionOnPowerset(): Orbit[] {
    let orbits = [];
    let tmpPowerset = new Map<number, IPcs>(this.powerset)
    while (tmpPowerset.size > 0) {
      let pcs = tmpPowerset.values().next().value
      pcs.addInOrbit(pcs); // add himself in orbit

      // by default, but recalled here.
      // It is important because affine operation and complement work with pcs.orbit.groupAction if
      // is set. Il will be set at end of this step of loop (after for loop below)
      pcs.orbit.groupAction = undefined

      // this pcs is processed, we can remove it from tmpPowerset
      tmpPowerset.delete(pcs.id);

      for (let i = 0; i < this.operations.length; i++) {
        let op = this.operations[i]
        let pcs_other = this.powerset.get(op.actionOn(pcs).id);
        // when op is M1-T0 (neutral operation) pcs_other.id === pcs.id, but
        // pcs is no longer into tmpPowerset (see just before this loop)
        if (pcs_other && tmpPowerset.has(pcs_other.id)) {
          // pcs_other is new image pcs by op
          pcs.addInOrbit(pcs_other)
          pcs_other.orbit = pcs.orbit // share same orbit
          // this pcs is processed, we can remove it from tmpPowerset
          tmpPowerset.delete(pcs_other.id)
        }
      }
      pcs.orbit.ipcsset.sort(IPcs.compare)
      pcs.orbit.groupAction = this // now add ref to this group action
      orbits.push(pcs.orbit);
    }
    return orbits.sort(Orbit.compare);
  }

  /**
   * pre-assert : each pcs has an orbit, and orbit has his set of pcs (bi-directionnel link)
   *              orbits are build via buildOrbitsByActionOnPowerset()
   *              Each pcs in orbit is image of any pcs in this same orbit
   *              by action of G on this pcs
   *
   * Build stabilizers of orbit for all orbits (therefore all powerset because orbits is partition of powerset)
   */
  private buildOrbitMetaStabilizers() {
    this.orbits.forEach(orbit => {
      orbit.ipcsset.forEach(pcs => {
        let newStab = new Stabilizer();
        this.operations.forEach(op => {
          // if not match, perhaps same op with other Tx will match
          // so, work only if Tx with x prime with n, be careful !
          if (pcs.id === op.actionOn(pcs).id) {
            // operation fix this pcs
            newStab.addFixedPcs(pcs);
            newStab.addOperation(op);
            op.addFixedPcs(pcs);
          }
        }) // end loop all op
        // note : stab identity is based on their operations (no change when add fixedPcs)
        let findStab = orbit.stabilizers.find(stab => stab.hashCode() === newStab.hashCode())
        if (!findStab) {
          orbit.stabilizers.push(newStab)
          // bi-directional link
          // pcs.stabilizer = newStab ?? see response in comment just below
        } else {
          findStab.addFixedPcs(pcs)
          // bi-directional link ?
          // pcs.stabilizer = findStab
          // hum... no because stabilizer depends on its IPivot...
          // so its dynamic (method getStabilizerOperations())
        }
      }) // en loop all pcs in current orbit
      // order operations and fixedPcs for each stabilizer in current orbit.
      orbit.stabilizers.forEach(stab => {
        stab.operations.sort(MusaicOperation.compare)
        stab.fixedPcs.sort(IPcs.compare)
      })
      // order collection stabilizers in current orbit
      orbit.stabilizers.sort(Stabilizer.compareShortName)

      // orbit is complete, we can set metaStabilizer property
      orbit.finalizeStateMetaStabilizer()
    }) // end loop orbits
  }

  get orbitsSortedGroupedByMetaStabilizer(): ISortedOrbits[] {
    if (!this._orbitsSortedGroupedByMetaStabilizer)
      this._orbitsSortedGroupedByMetaStabilizer = this.computeSortedOrbitsGroupedByMetaStabilizer()

    return this._orbitsSortedGroupedByMetaStabilizer
  }

  get orbitsSortedGroupedByStabilizer() {
    if (!this._orbitsSortedGroupedByStabilizer)
      this._orbitsSortedGroupedByStabilizer = this.computeSortedOrbitsGroupedByStabilizer()

    return this._orbitsSortedGroupedByStabilizer
  }

  get orbitsSortedGroupedByCardinal(): ISortedOrbits[] {
    if (!this._orbitsSortedGroupedByCardinal)
      this._orbitsSortedGroupedByCardinal = this.computeSortedOrbitsGroupedByCardinal()

    return this._orbitsSortedGroupedByCardinal
  }

  /**
   * this => instance is complete (done)
   *
   * Partition orbits list in "sets" of orbit. Each set is grouped by
   * equivalence relation "have same stabilizer set"
   * @param byReduceStabilizerName as grouping criteria
   * @return {ISortedOrbits[]} array of ISortedOrbits
   */
   computeSortedOrbitsGroupedByStabilizer(byReduceStabilizerName : boolean = true ): ISortedOrbits[] {
    let orbitsSortedByStabilizers = new Map<string, Orbit[]>()
    // key=name orbit based on his stabs, value=array of orbits

    this.orbits.forEach(orbit => {
      // stabilizer based name (orbit.name is in short name format stabilizers ex: M1-T0~1)
      const orbitName = byReduceStabilizerName ? orbit.reducedStabilizersName : orbit.getAllStabilizersName()
      if (!orbitsSortedByStabilizers.has(orbitName)) {
        orbitsSortedByStabilizers.set(orbitName, [orbit])
      } else {
        // ! operator avoid to use @ts-ignore undefined get element
        orbitsSortedByStabilizers.get(orbitName)!.push(orbit)
      }
    }) // end loop orbits

    let resultOrbitsSortedByStabilizers: ISortedOrbits[] = []
    // Array.from(orbitsSortedByStabilizers.keys()).sort().forEach((name) => {
    Array.from(orbitsSortedByStabilizers.keys()).sort(
      (a, b) => {
        return orbitsSortedByStabilizers.get(a)!.length - orbitsSortedByStabilizers.get(b)!.length
      }).forEach((name) => {
      const obj: ISortedOrbits =
        {
          groupingCriterion: name,
          // to avoid duplicate keys in vue
          hashcode: StringHash.stringHashCode(name) + Date.now(),
          orbits: orbitsSortedByStabilizers.get(name) ?? [] //  always set
        }
      resultOrbitsSortedByStabilizers.push(obj)
    })

    return resultOrbitsSortedByStabilizers
  }


  /**
   * @return {ISortedOrbits[]} array of ISortedOrbits
   */
  private computeSortedOrbitsGroupedByMetaStabilizer(): ISortedOrbits[] {
    let orbitsSortedGroupedByMetaStabilizer = new Map<MetaStabilizer, Orbit[]>()
    // key=MetaStabilizer orbit based on his stabs, value=array of Orbit having same MetaStabilizer
    this.orbits.forEach(orbit => {
      let kMetaStab = Array.from(orbitsSortedGroupedByMetaStabilizer.keys())
        .find(ms => ms.hashCode() === orbit.metaStabilizer.hashCode())
      if (kMetaStab !== undefined) {
        orbitsSortedGroupedByMetaStabilizer.get(kMetaStab)!.push(orbit)
      } else {
        orbitsSortedGroupedByMetaStabilizer.set(orbit.metaStabilizer, [orbit])
      }
    })
    // sort operations
    // make a "view adapter" (initially for Vue v-for and cache)
    let resultOrbitsSortedGroupedByMetaStabilizer: ISortedOrbits[] = []
    Array.from(orbitsSortedGroupedByMetaStabilizer.keys()).sort(
      (a, b) => {
        return orbitsSortedGroupedByMetaStabilizer.get(a)!.length - orbitsSortedGroupedByMetaStabilizer.get(b)!.length
      }).forEach(metaStab => {
      const obj: ISortedOrbits =
        {
          groupingCriterion: metaStab.name,
          // to avoid duplicate keys in vue
          hashcode: StringHash.stringHashCode(metaStab.name) + Date.now(),
          orbits: orbitsSortedGroupedByMetaStabilizer.get(metaStab)!.sort(Orbit.comparePcsMin)
        }
      resultOrbitsSortedGroupedByMetaStabilizer.push(obj)
    })
    return resultOrbitsSortedGroupedByMetaStabilizer
  }

  /**
   * @return {ISortedOrbits[]} array of ISortedOrbits
   */
  private computeSortedOrbitsGroupedByCardinal(): ISortedOrbits[] {
    let orbitsSortedByCardinal = new Map() // k=name orbit based on his stabs, v=array of orbits
    this.orbits.forEach(orbit => {
      let card = Array.from(orbitsSortedByCardinal.keys()).find(card => card === orbit.getPcsMin().cardinal)
      // orbit name based on his stabilizers and shortName
      if (!card)
        orbitsSortedByCardinal.set(orbit.getPcsMin().cardinal, [orbit])
      else
        orbitsSortedByCardinal.get(card).push(orbit)
    })
    const isComplemented = this.group.isComplemented()
    // sort operations
    // make a "view adapter"
    let resultOrbitsSortedByCardinal: ISortedOrbits[] = []
    // default, sort cast key to string...
    Array.from(orbitsSortedByCardinal.keys()).sort((a, b) => (Number(a) - Number(b))).forEach(card => {
      let _groupingCriterion: string = ' card : ' + card
      if (isComplemented) {
        _groupingCriterion += "/" + (this.n - card)
      }
      const obj: ISortedOrbits =
        {
          groupingCriterion: _groupingCriterion,
          // to avoid duplicate keys in vue
          hashcode: card + Date.now(),
          orbits: orbitsSortedByCardinal.get(card).sort(Orbit.comparePcsMin)
        }
      resultOrbitsSortedByCardinal.push(obj)
    })
    return resultOrbitsSortedByCardinal
  }

  cardinalOfOrbitStabilized() {
    return this.orbitsSortedGroupedByStabilizer.reduce((sum, sortedOrbits) => sum + sortedOrbits.orbits.length, 0)
  }

  getOrbitOf(pcs: IPcs): Orbit {
    if (pcs.n !== this.n) throw new Error(`Invalid dimension : pcs.n and this.n : ${pcs.n} !== ${this.n}`)

    let orbit: Orbit | undefined = this.powerset.get(pcs.id)?.orbit
    if (!orbit)
      throw new Error(`Invalid pcs (is not in this group action)  ??? : ${pcs} and ${this.group.name}`)
    return orbit
  }

  /**
   * Get pcs into orbit from a pcs given. If not same state, then create new instance image
   * @param {IPcs} pcs
   * @return {IPcs}
   * @throws Error if not find pcs in this group action
   */
  getIPcsInOrbit(pcs: IPcs): IPcs {
    let pcsInOrbit: IPcs | undefined = this.powerset.get(pcs.id)
    if (!pcsInOrbit) {
      throw new Error(`Invalid pcs (is not in this group action)  ??? : ${pcs}`)
    }
   if (pcs.nMapping !== pcsInOrbit.nMapping
      || pcs.templateMapping !== pcsInOrbit.templateMapping
      || pcs.iPivot !== pcsInOrbit.iPivot) {

     pcsInOrbit = pcsInOrbit.cloneWithData( {
       pivot: pcs.iPivot,
       orbit: pcsInOrbit.orbit,
       nMapping:pcs.nMapping,
       templateMapping: pcs.templateMapping
     })

   }
   return pcsInOrbit
  }

  /**
   *  Also named order
   */
  get cardinal() {
    return this.operations.length
  }

  /**
   * Get the pcs having aa intervallic structure given
   * @param intervallicStructure
   * @return pcs or undefined if not found
   */
  getPcsWithThisIS(intervallicStructure: string): IPcs | undefined {
    for (const orbit of this.orbits) {
      const pcs = orbit.getPcsWithThisIS(intervallicStructure)
      if (pcs) return pcs
    }
    return undefined
  }

  /**
   * Get the pcs having a pid given
   * @param pid
   * @return pcs or undefined if not found
   */
  getPcsWithThisPid(pid: number): IPcs | undefined {
    for (const orbit of this.orbits) {
      const pcs = orbit.getPcsWithThisPid(pid)
      if (pcs) return pcs
    }

    // this.powerset.values() below create new iterator (cost to be verified)
    // while loop above use existing structures
    // so, it's preferred even if more loop structures are used

    // for (const pcs of this.powerset.values()) {
    //   if (pcs.pid() === pid) return pcs
    // }
    return undefined
  }


  /**
   * form operations list build simple name
   * Ex: M1-T0, M1-T5, M5-T1, M5-T8 => M1, M5
   * @private
   */
  private buildOpNameWithoutTxToString() {
    const isStabilizersMap = new Map<string, boolean>()
    this.operations.forEach((o) => isStabilizersMap.set(o.toStringWithoutTransp(), true))
    return Array.from(isStabilizersMap.keys()).join(" ")
  }


}
