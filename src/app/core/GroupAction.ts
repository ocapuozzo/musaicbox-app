/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the MusaicBox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {IPcs} from "./IPcs";
import {Orbit} from "./Orbit";
import {Group} from "./Group";
import {Stabilizer} from "./Stabilizer";
import {MusaicPcsOperation} from "./MusaicPcsOperation";
import {MotifStabilizer} from "./MotifStabilizer";
import {StringHash} from "../utils/StringHash";
import {ISortedOrbits} from "./ISortedOrbits";

export class GroupAction {
  n: number = -1;
  group: Group;
  operations: MusaicPcsOperation[];
  // min operation = neutral operation = operations.get(0)
  powerset: Map<number, IPcs>;
  orbits: Orbit[];

  operationsNameWithoutTxStr : string

  private _orbitsSortedByStabilizers ?: ISortedOrbits[];
  private _orbitsSortedByMotifStabilizers ?: ISortedOrbits[];
  private _orbitsSortedByCardinal ?: ISortedOrbits[];

  private static _predefinedGroupsActions: Map<number, GroupAction[]>


  constructor(
    {n, someMusaicOperations, group}:
      { n?: number, someMusaicOperations?: MusaicPcsOperation[], group?: Group } = {}) {
    if (group) {
      this.group = group
      this.n = group.operations[0].n
    } else {
      this.n = n ?? (someMusaicOperations ? someMusaicOperations[0].n : 12);
      this.group = new Group(someMusaicOperations ?? [new MusaicPcsOperation(this.n, 1, 0)]);
    }
    // this.group = new Group(someMusaicOperations ?? []);
    this.operations = this.group.operations;
    // min operation = neutral operation = operations.get(0)
    this.powerset = GroupAction.buildPowerSetOfIPcs(this.n);
    this.orbits = this.buildOrbitsByActionOnPowerset();

    this._orbitsSortedByStabilizers = undefined
    this._orbitsSortedByMotifStabilizers = undefined
    this._orbitsSortedByCardinal = undefined

    this.buildOrbitMotifStabilizers()
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
   *         (partition)
   *
   */
  private buildOrbitsByActionOnPowerset(): Orbit[] {
    let orbits = [];
    let tmpPowerset = new Map<number, IPcs>(this.powerset)
    while (tmpPowerset.size > 0) {
      let pcs = tmpPowerset.values().next().value
      pcs.addInOrbit(pcs); // add himself in orbit
      pcs.orbit.groupAction = this // add ref to this group action
      // this pcs is processed, we can remove it from tmpPowerset
      tmpPowerset.delete(pcs.id);
      for (let i = 0; i < this.operations.length; i++) {
        let op = this.operations[i]
        let pcs_other = this.powerset.get(op.actionOn(pcs).id);
        if (pcs_other && tmpPowerset.has(pcs_other.id)) {
          // pcs_other is new image pcs by op
          pcs.addInOrbit(pcs_other)
          pcs_other.orbit = pcs.orbit // share same orbit
          // this pcs is processed, we can remove it from tmpPowerset
          tmpPowerset.delete(pcs_other.id)
        }
      }
      pcs.orbit.ipcsset.sort(IPcs.compare)
      orbits.push(pcs.orbit);
    }
    return orbits.sort(Orbit.compare);
  }

  /**
   * pre-assert : each pcsList has an orbit, and orbit has his set of pcsList.
   *              orbits are build via buildOrbitsByActionOnPowerset()
   *              Each pcsList in orbit is image of any pcsList in this same orbit
   *              by action of G on this pcsList
   *
   * Build stabilizers orbit for all orbits
   */
  private buildOrbitMotifStabilizers() {
    this.orbits.forEach(orbit => {
      orbit.ipcsset.forEach(pcs => {
        let newStab = new Stabilizer();
        this.operations.forEach(op => {
          if (pcs.equalsPcs(op.actionOn(pcs))) {
            // operation fix this pcsList
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
          pcs.stabilizer = newStab
        } else {
          findStab.addFixedPcs(pcs)
          // bi-directional link
          pcs.stabilizer = findStab
        }
      }) // en loop all pcsList in current orbit
      // order operations and fixedPcs for each stabilizer in current orbit.
      // rem : if CYCLIC group, stabilizers.length==1
      orbit.stabilizers.forEach(stab => {
        stab.operations.sort(MusaicPcsOperation.compare)
        stab.fixedPcs.sort(IPcs.compare)
      })
      // order collection stabilizers in current orbit
      orbit.stabilizers.sort(Stabilizer.compareShortName)

      // orbit is complete, we can set his motif stabilizer property (orbit.motifStabilizer)
      orbit.checkAndBuildMotifStabilizerOfOrbit()
    }) // end loop orbits
  }

  get orbitsSortedByMotifStabilizers(): ISortedOrbits[] {
    if (!this._orbitsSortedByMotifStabilizers)
      this._orbitsSortedByMotifStabilizers = this.computeOrbitSortedByMotifStabilizers()

    return this._orbitsSortedByMotifStabilizers
  }

  get orbitsSortedByStabilizers() {
    if (!this._orbitsSortedByStabilizers)
      this._orbitsSortedByStabilizers = this.computeOrbitSortedByStabilizers()

    return this._orbitsSortedByStabilizers
  }

  get orbitsSortedByCardinal(): ISortedOrbits[] {
    if (!this._orbitsSortedByCardinal)
      this._orbitsSortedByCardinal = this.computeOrbitSortedByCardinal()

    return this._orbitsSortedByCardinal
  }


  /**
   * Partitionne each orbit in sub-orbits based on their stabilizers
   * @return {ISortedOrbits[]} array of ISortedOrbits
   */
  private computeOrbitSortedByStabilizers(): ISortedOrbits[] {
    let orbitsSortedByStabilizers = new Map<string, Orbit[]>() // k=name orbit based on his stabs, v=array of orbits
    this.orbits.forEach(orbit => {
      const orbitName = orbit.name  // stabilizer based
      if (!orbitsSortedByStabilizers.has(orbitName)) {
        orbitsSortedByStabilizers.set(orbitName, [orbit])
      } else {
        // ! operator avoid to use @ts-ignore undefined get element
        orbitsSortedByStabilizers.get(orbitName)!.push(orbit)
      }
    }) // end loop orbits

    // sort map on keys (lexical order)
    // make a "view adapter" for v-for

    // TODO : la clé name ne semble pas complète, car si on prend une orbite (pcsList min représenté)
    //  et que l'on le push sur home, on s'aperçoit que le nom (groupingCriterion) est restreint à un des stabilisateurs
    //  et non basé sur l'ensemble des stab. ????

    let resultOrbitsSortedByStabilizers: ISortedOrbits[] = []
    Array.from(orbitsSortedByStabilizers.keys()).sort().forEach((name) => {
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
  //
  // private _computeOrbitSortedByStabilizers(): ISortedOrbits[] {
  //   let orbitsSortedByStabilizers = new Map<string, Orbit[]>() // k=name orbit based on his stabs, v=array of orbits
  //   this.orbits.forEach(orbit => {
  //     orbit.stabilizers.forEach(stab => {
  //       // make an subOrbit based on stabilizer : subOrbits partitioning orbit
  //       let subOrbit = new Orbit({stabs: [stab], ipcsSet: stab.fixedPcs})
  //
  //       let nameStab = stab.getShortName()
  //       if (!orbitsSortedByStabilizers.has(nameStab)) {
  //         orbitsSortedByStabilizers.set(nameStab, [subOrbit])
  //       } else {
  //         // @ts-ignore undefined get element
  //         orbitsSortedByStabilizers.get(nameStab).push(subOrbit)
  //       }
  //     }) // end loop all stab of current orbit
  //   }) // end loop orbits
  //
  //   // sort map on keys (lexical order)
  //   // make a "view adapter" for v-for
  //   let resultOrbitsSortedByStabilizers: ISortedOrbits[] = []
  //   Array.from(orbitsSortedByStabilizers.keys()).sort().forEach((name) => {
  //     const obj: ISortedOrbits =
  //       {
  //         groupingCriterion: name,
  //         // to avoid duplicate keys in vue
  //         hashcode: StringHash.stringHashCode(name) + Date.now(),
  //         orbits: orbitsSortedByStabilizers.get(name) ?? [] //  always set
  //       }
  //     resultOrbitsSortedByStabilizers.push(obj)
  //   })
  //
  //   return resultOrbitsSortedByStabilizers
  // }

  /**
   * @return {ISortedOrbits[]} array of ISortedOrbits
   */
  private computeOrbitSortedByMotifStabilizers(): ISortedOrbits[] {
    let orbitsSortedByMotifStabilizer = new Map() // k=name orbit based on his stabs, v=array of orbits
    this.orbits.forEach(orbit => {
      let kNameMotifStab = Array.from(orbitsSortedByMotifStabilizer.keys())
        .find(ms => ms.hashCode() === orbit.motifStabilizer.hashCode())
      // orbit name based on his stabilizers and shortName
      if (!kNameMotifStab) {
        orbitsSortedByMotifStabilizer.set(orbit.motifStabilizer, [orbit])
      } else {
        orbitsSortedByMotifStabilizer.get(kNameMotifStab).push(orbit)
      }
    })
    // sort operations
    // make a "view adapter" (initially for Vue v-for and this cache)
    let resultOrbitsSortedByMotifStabilizer: ISortedOrbits[] = []
    Array.from(orbitsSortedByMotifStabilizer.keys()).sort(MotifStabilizer.compare).forEach(motifStab => {
      const obj: ISortedOrbits =
        {
          groupingCriterion: motifStab.name,
          // to avoid duplicate keys in vue
          hashcode: StringHash.stringHashCode(motifStab.name) + Date.now(),
          orbits: orbitsSortedByMotifStabilizer.get(motifStab).sort(Orbit.comparePcsMin)
        }
      resultOrbitsSortedByMotifStabilizer.push(obj)
    })
    return resultOrbitsSortedByMotifStabilizer
  }


  /**
   * @return {ISortedOrbits[]} array of ISortedOrbits
   */
  private computeOrbitSortedByCardinal(): ISortedOrbits[] {
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
      let _groupingCriterion : string= ' card : ' + card
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
    return this.orbitsSortedByStabilizers.reduce((sum, sortedOrbits) => sum + sortedOrbits.orbits.length, 0)
  }


  getOrbitOf(ipcs: IPcs): Orbit {
    if (ipcs.n !== this.n) throw new Error("Invalid dimension : pcsList.n and this.n : " + ipcs.n + " !== " + this.n)
    //let orbit : Orbit | undefined = this.orbits.find(o => o.ipcsset.find(ipcs2 => ipcs2.compareTo(pcsList)==0))
    let orbit: Orbit | undefined = this.powerset.get(ipcs.id)?.orbit
    if (!orbit)
      throw new Error("Invalid pcsList (is not in this group action)  ??? : " + ipcs)
    return orbit
  }

  /**
   * From free IPcs (with no orbit) get a represented IPcs held by a group action
   * @param {IPcs} pcs
   * @param withPivot return pcsList with this.iPivot = withPivot, if withPivot != -1 (and valid)
   * @return {IPcs}
   * @throws Error if not find pcsList in this group action or if withPivot is invalid
   */
  getIPcsInOrbit(pcs: IPcs, withPivot = -1): IPcs {
    let pcsInOrbit: IPcs | undefined = this.powerset.get(pcs.id)
    if (!pcsInOrbit)
      throw new Error("Invalid pcsList (is not in this group action)  ??? : " + pcs)

    if (withPivot != -1) {
      // change state (be careful : side effect !!) - Error if invalid new pivot
      pcsInOrbit.setPivot(withPivot)
    }
    return pcsInOrbit
  }

  // initialize some predefined Groups Actions
  static predefinedGroupsActions(n: number, index: number): GroupAction {
    if (!GroupAction._predefinedGroupsActions) {
      GroupAction.createPredefinedGroupAction()
    }
    // if not exist, create only Cyclic group action
    if ( ! GroupAction._predefinedGroupsActions.has(n)) {
      const opM1T1 = new MusaicPcsOperation(n, 1,1, false)
      const groupAction = new GroupAction({someMusaicOperations: [opM1T1]})
      // add Cyclic group action (Group.CYCLIC is 0, match index first element of array)
      GroupAction._predefinedGroupsActions.set(n, [groupAction])
    }

    if (index < 0 && index >= GroupAction._predefinedGroupsActions.get(n)?.length!) {
      throw new Error('No predefined group action for n=' + n + ' and index=' + index + ' ! ')
      // return GroupAction._predefinedGroupsActions.get(n)![Group.CYCLIC]
    } else {
      return GroupAction._predefinedGroupsActions.get(n)![index]
    }

  }

  get cardinal() {
    return this.operations.length
  }

  private static createPredefinedGroupAction() : void {
    GroupAction._predefinedGroupsActions = new Map<number, GroupAction[]>
    let groupsActions: GroupAction[] = new Array<GroupAction>()
    // index == 0 == Group.CYCLIC
    groupsActions.push(new GroupAction({group: Group.predefinedGroups12[Group.CYCLIC]}))

    // index == 1 == Group.DIHEDRAL
    groupsActions.push(new GroupAction({group: Group.predefinedGroups12[Group.DIHEDRAL]}))

    // index == 2 == Group.AFFINE
    groupsActions.push(new GroupAction({group: Group.predefinedGroups12[Group.AFFINE]}))

    // index == 3 == Group.MUSAIC
    groupsActions.push(new GroupAction({group: Group.predefinedGroups12[Group.MUSAIC]}))

    GroupAction._predefinedGroupsActions.set(12, groupsActions)

    groupsActions = new Array<GroupAction>()
    //Cyclic
    let opM1_T1 = new MusaicPcsOperation(7, 1, 1, false);
    let group7Cyclic = new GroupAction({n:7, someMusaicOperations:[opM1_T1]})
    groupsActions.push(group7Cyclic)

    //Dihedral
    let opM6_T1 = new MusaicPcsOperation(7, 6, 1, false);
    groupsActions.push(new GroupAction({n:7, someMusaicOperations:[opM1_T1, opM6_T1]}))

    // bad Affine (Dihedral again, temporary for test)
    groupsActions.push(new GroupAction({n:7, someMusaicOperations:[opM1_T1, opM6_T1]}))

    // bad musaic
    let opM6_T1C = new MusaicPcsOperation(7, 6, 1, true);
    groupsActions.push(new GroupAction({n:7, someMusaicOperations:[opM1_T1, opM6_T1, opM6_T1C]}))

    GroupAction._predefinedGroupsActions.set(7, groupsActions)
  }

  getPcsWithThisIS(intervallicStructure : string): IPcs | undefined {
    for (const orbit of this.orbits) {
      const pcs = orbit.getPcsWithThisIS(intervallicStructure)
      if (pcs) return pcs
    }
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
    let isOpWithoutT = ''
    for (const opWithoutTElement of isStabilizersMap.keys()) {
      isOpWithoutT = isOpWithoutT ? isOpWithoutT +', ' + opWithoutTElement : opWithoutTElement
    }
    return isOpWithoutT
  }
}
