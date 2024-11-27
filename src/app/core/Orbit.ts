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
   * @see buildNameAndMotifStabilizerName
   */
  motifStabilizer: MotifStabilizer  // stab without Tx

  _hashcode ?: number

  _name : string

  constructor(
    {stabs, ipcsSet}:
      { stabs?: Stabilizer[], ipcsSet?: IPcs[] } = {}) {
    this.stabilizers = stabs ?? []
    this.ipcsset = ipcsSet ?? []
    this._hashcode = undefined
    this.motifStabilizer = MotifStabilizer.manyMotifsStabilizer

    // this.buildStabilizersSignatureName() no, do not !

    // orbit is not an immutable class. During the GroupAction constructor,
    // the orbit instance changes state until the orbit construction is complete.
    // When it's done, the GroupAction constructor calls this.buildStabilizersSignatureName()
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
      this._hashcode = res //StringHash.stringHashCode(this.toString())
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
   * Name based on stabilizers, by reduction
   * Example (Musaic n° 84) : M1-T0 M7-T3~6* CM5-T2~4* CM11-T1~2*
   * @return {string}
   */
  get name() {
    if (!this._name) {
      return this.buildStabilizersSignatureName();
    }
    return this._name
  }

  /**
   * Create a name signature of this orbit based on his stabilizers
   * Example :
   *   stabilizers of Musaic n° 84 (24 pcsList in orbit) :
   *     M1-T0 M7-T9 CM5-T10 CM11-T7 (4)
   *     M1-T0 M7-T3 CM5-T10 CM11-T1 (4)
   *     M1-T0 M7-T3 CM5-T6 CM11-T9 (3)
   *     M1-T0 M7-T9 CM5-T6 CM11-T3 (3)
   *     M1-T0 M7-T9 CM5-T2 CM11-T11 (5)
   *     M1-T0 M7-T3 CM5-T2 CM11-T5 (5
   *
   *  signature orbit, stabilizers based is : M1-T0 M7-T3~6* CM5-T2~4* CM11-T1~2*
   *
   *  TODO : refactor because too long !
   *
   * @private
   */
  private buildStabilizersSignatureName() {
    let res = ""
    // 1 get all operations
    // key : "Ma" or "CMa" op name (Ex: M5, CM5) nameOpsWithoutT
    // value : x of TX (Ex : 2, 3, 4) transposition value
    let cmt = new Map<string, number[]>()
    for (const stab of this.stabilizers) {
      // assert in : operations is sorted
      for (let i = 0; i < stab.operations.length; i++) {
        let op = stab.operations[i]
        let nameOpWithoutT = (op.complement ? "CM" : "M") + op.a;
        if (!cmt.has(nameOpWithoutT)) {
          cmt.set(nameOpWithoutT, []);
        }
        if (!cmt.get(nameOpWithoutT)?.includes(op.t)) {
          cmt.get(nameOpWithoutT)!.push(op.t);
        }
      }
    }

    // 2: sort operations Mx < Mx+1 < CMx < CMx+1
    let nameOpsWithoutT = Array.from(cmt.keys())
    nameOpsWithoutT.sort((o1, o2) => {
      let cplt1 = o1.charAt(0) === 'C';
      let cplt2 = o2.charAt(0) === 'C';
      let w1;
      let w2;
      if (cplt1)
        w1 = 100 + parseInt(o1.substring(2));
      else
        w1 = parseInt(o1.substring(1));

      if (cplt2)
        w2 = 100 + parseInt(o2.substring(2));
      else
        w2 = parseInt(o2.substring(1));

      return w1 - w2;
    })

    // 3: reducer name by extracting the transposition coefficient x, as ~x*
    // CM5-T2 CM5-T6 CM5-T10 => CM5-T2~4*  (4 is transposition coefficient, equivalent 'up to 4-steps translation')
    // M11-T0 M11-T2 M11-T4 M11-T6 M11-T8 M11-T10 => M11-T0~2*
    for (let i = 0; i < nameOpsWithoutT.length; i++) {
      let nameOpWithoutT = nameOpsWithoutT[i]
      let shortName = ''
      if (cmt.get(nameOpWithoutT)!.length > 1) {
        cmt.get(nameOpWithoutT)?.sort((a, b) => a - b)
        // cmt.get(nameOpWithoutT)?.forEach(a => console.log(a + ''))
        let step = cmt.get(nameOpWithoutT)![1] - cmt.get(nameOpWithoutT)![0]
        shortName = nameOpWithoutT + "-T" + cmt.get(nameOpWithoutT)![0] + "~" + step + "*";
        // when shortName is defined, delete entry
        cmt.delete(nameOpWithoutT)

        res = (res.length > 1) ? res + ' ' + shortName : shortName
      }

      // 4: put -Tx only if a (mt is maybe reduce by preview phase 3)
      let the_as = cmt.get(nameOpWithoutT) ?? []
      for (let j = 0; j < the_as.length; j++) {
        let a = the_as[j]
        if (res.length > 0) {
          res += " ";
        }
        res += nameOpWithoutT + "-T" + a;
      } // loop a
    } // loop for nameOpsWithoutT

    // 5: add M1-T0 if not present (neutral operation)
    return this._name = res.startsWith('M1-T0') ? res : 'M1-T0 ' + res
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
   *   @return {MotifStabilizer} the motifStabilizer of this orbit
   */
  buildNameAndMotifStabilizerName(): MotifStabilizer {
    const stabSignature = this.buildStabilizersSignatureName() // set this.name
    // take left part of "M1-T0 CM11-Tx~m" => "M1 CM11"
    // note : there are no 2 CM11-Tx CM11-Ty in a same stabilizer
    const signatureWithoutTranslation =
      stabSignature.split(" ").map(op=> op.trim().split("-")[0]).join(" ");
    return this.motifStabilizer = new MotifStabilizer(signatureWithoutTranslation)
  }

  /**
   * return true if stabilizers include relationship equivalence to nearest transposition (M1-T1)
   * @return {Boolean}
   */
  get isMotifEquivalence(): boolean {
    return this.stabilizers.some(stab => stab.isMotifEquivalence)
  }

  isDetached(): boolean {
    return this.groupAction === undefined // or this.ipcsset.length == 0
  }

  has(pcs: IPcs):boolean {
    return this.ipcsset.find( p => p.id == pcs.id) !== undefined
  }

  getPcsWithThisIS(intervallicStructure: string):IPcs | undefined {
    return this.ipcsset.find( p => p.is().toString() === intervallicStructure)
  }

  getPcsWithThisPid(pid: number) {
    return this.ipcsset.find( p => p.pid() === pid)
  }

}
