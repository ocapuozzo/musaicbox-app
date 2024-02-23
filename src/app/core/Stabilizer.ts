/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {StringHash} from "../utils/StringHash";
import {MotifStabilizer} from "./MotifStabilizer";
import {IPcs} from "./IPcs";
import {MusaicPcsOperation} from "./MusaicPcsOperation";

export class Stabilizer {
  fixedPcs: IPcs[];
  operations: MusaicPcsOperation[];
  metaStabilizer: string;
  _shortName: string
  _isMotifStabilizer ?: MotifStabilizer
  _hashCode ?: number
  sumT: number
  _fixedPcsInPrimeForm: IPcs[]

  constructor(
    {fixedPcs, operations}:
      { fixedPcs?: IPcs[], operations?: MusaicPcsOperation[] } = {}) {
    this.fixedPcs = fixedPcs ?? []
    this.operations = operations ?? [];
    this.metaStabilizer = "";
    this._shortName = ""
    this._hashCode = undefined
    this._isMotifStabilizer = undefined
    this.sumT = this.computeSumTNear0();
    this._fixedPcsInPrimeForm = []
  }

  /**
   * if n = 12, 9 and 3 are both as close as possible from zero
   *
   * @return {number} sum of step near zero of t
   */
  computeSumTNear0(): number {
    let sum = 0;
    if (this.operations.length > 0) {
      let delta = this.operations[0].n / 2

      this.operations.forEach((op) => {
        if (op.t > delta)
          sum += op.n - op.t;
        else
          sum += op.t;
        // T10 greater than T2 ? T6 = 6 see Orbit N°74
      })
    }
    return sum;
  }

  addOperation(op: MusaicPcsOperation) {
    if (!this.operations.find(o => o.getHashCode() === op.getHashCode())) {
      this.operations.push(op);
      this.sumT = this.computeSumTNear0();
      this.operations.sort(MusaicPcsOperation.compare);
      this.metaStabilizer = "";
      this._shortName = "";
      this._hashCode = undefined
      this._isMotifStabilizer = undefined
      this._fixedPcsInPrimeForm = []
    }
  }

  addFixedPcs(ipcs: IPcs) {
    if (!this.fixedPcs.find(p => p.id === ipcs.id)) {
      this.fixedPcs.push(ipcs)
      this._fixedPcsInPrimeForm = []
      // this._hashCode = null
    }
  }

  toString() {
    return "Stab: " + this.operations + " #FixedPcs: " + this.fixedPcs.length;
  }

  hashCode() {
    if (!this._hashCode) {
      this._hashCode = StringHash.stringHashCode(this.getName())
    }
    return this._hashCode
  }

  // https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
  arraysEqual(a: any, b: any) {
    /*
        Array-aware equality checker:
        Returns whether arguments a and b are == to each other;
        however if they are equal-lengthed arrays, returns whether their
        elements are pairwise == to each other recursively under this
        definition.
    */
    if (a instanceof Array && b instanceof Array) {
      if (a.length !== b.length)  // assert same length
        return false;
      for (let i = 0; i < a.length; i++)  // assert each element equal
        if (!this.arraysEqual(a[i], b[i]))
          return false;
      return true;
    } else {
      return a === b;  // if not both arrays, should be the same
    }
  }

  equals(obj: any) {
    if (this === obj)
      return true;
    if (obj === null)
      return false;
    if (!(obj instanceof Stabilizer))
      return false;
    if (this.operations == null) {
      if (obj.operations != null)
        return false;
    } else if (!this.arraysEqual(this.operations, obj.operations))
      return false;
    return true;
  }

  get motifStabilizer() {
    if (!this._isMotifStabilizer) {
      this._isMotifStabilizer = new MotifStabilizer(this.reduceNameByIgnoreTransp().trim())
    }
    return this._isMotifStabilizer
  }

  /**
   * Reduce String name by delete ref to Transposition operation and no
   * duplication examples :
   *
   * <pre>
   * <ul>
   * <li>M1-T0 => M1</li>
   * <li>M1-T1 => M1</li>
   * <li>M1-T3, M1-T4, CM1-T11, CM7-T0 => M1,CM1,CM7 (no duplication)</li>
   * </ul>
   * </pre>
   * @precondition this.operations is sorted
   * @return {string}  name signature without T op
   */
  reduceNameByIgnoreTransp(): string {
    let res = "";
    let prec: string | null = null
    this.operations.forEach(op => {
      let motif = op.toStringWithoutTransp();
      if (motif !== prec) {
        prec = motif;
        if (res.length > 0)
          res += ",";
        res = res + op.toStringWithoutTransp();
      }
    })
    return res;
  }

  /*
    public Fix getFix() {
      return fixedPcs;
    }

    public void setOperations(List<MusaicPcsOperation> operations) {
      this.operations = operations;
      metaStabilizer = null;
      _shortName = null;
    }
    */
  get cardinal() {
    return this.operations.length;
  }

  /*

  clear() {
    this.operations = []
    this.fixedPcs = []
    this.metaStabilizer = null;
    this._shortName = null;
    this._hashCode = null;
    this._isMotifStabilizer = ""
  }
*/

  compareTo(otherStab: Stabilizer): number {
    // return this.getName().compare(o.getName());
    return Stabilizer.compare(this, otherStab)
  }

  // TODO cache in const COMP_SHORT_NAME map with key is this.hashCode() ?
  static compareShortName(stab1: Stabilizer, stab2: Stabilizer) {
    return StringHash.stringHashCode(stab1.getShortName()) - StringHash.stringHashCode(stab2.getShortName())
  }

  static compare(stab1: Stabilizer, stab2: Stabilizer) {
    let cmp = 0 // stab1.operations.length - stab2.operations.length
    if (cmp === 0) {
      for (let i = 0; i < stab1.operations.length; i++) {
        let op = stab1.operations[i]
        if (i < stab2.operations.length) {
          cmp = op.compareTo(stab2.operations[i]);
          if (cmp !== 0)
            // and x.operations.length compareTo ?
            return cmp;
        }
      }
    }
    return cmp;
  }

  /*
  public MetaStabilizer getMetaStabilizer() {
    if (metaStabilizer == null)
      metaStabilizer = new MetaStabilizer(reduceByIgnoreTransp());
    return metaStabilizer;
  }
  */

  getName() {
    let res = "";
    this.operations.forEach(op => res = res + " " + op.toString());
    return res;
    // return this.getShortName() + "";
  }

  getShortName() {
    if (!this._shortName)
      this._shortName = this.makeShortName();
    return this._shortName;
  }

  /**
   * get short name of recure operations
   * CM1-T0 CM1-T4 CM1-T8 => CM1-T0~4*
   * CM1-T3 CM1-T9 => CM1-T3~6*
   * CM1-T1 CM1-T3 CM1-T5 CM1-T7 CM1-T9 CM1-T11 => CM1-T1~2*
   * M1-T0 M11-T1 => M1-T0 M11-T1
   * @return {string} short name if possible
   */
  makeShortName(): string {
    // key="CM5"=, values=[2,4,6] for value of transposition/translation for CM5-T2, CM5-T4, etc.
    // Map<String, List<Integer>> mt = new HashMap<String, List<Integer>>();
    let mt = new Map<string, number[]>()
    // assert in : operations is sorted
    for (let i = 0; i < this.operations.length; i++) {
      let op = this.operations[i]
      //  this.operations.forEach(op => {
      let nameOp = (op.complement ? "CM" : "M") + op.a;
      if (!mt.has(nameOp)) {
        mt.set(nameOp, []);
      }
      // @ts-ignore
      mt.get(nameOp).push(op.t);
    } //)

    // let testnameOps = Array.from(mt.keys())
    // testnameOps.forEach(k => console.log("mt[" + k + "] = " + mt.get(k)))

    let nameOps = Array.from(mt.keys())
    nameOps.sort((o1, o2) => {
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

    // System.out.println("ops :" + Arrays.toString(nameOps));
    //nameOps.forEach(nameOp => {
    let res = "";
    for (let i = 0; i < nameOps.length; i++) {
      let nameOp = nameOps[i]
      let shortName = this.tryReduceListByShortName(mt, nameOp) + "";

      if (shortName.length > 0) {
        if (res.length > 0) {
          res += " ";
        }
        res += nameOp + shortName;
      }
      // put -Tx only if a

      let the_as = mt.get(nameOp) ?? []
      for (let j = 0; j < the_as.length; j++) {
        let a = the_as[j]
        // mt.get(nameOp).forEach(a => {
        if (res.length > 0) {
          res += " ";
        }
        res += nameOp + "-T" + a;
      } //)
    }
    return res;
  }

  /**
   * If recurrence transposition step, reduce this by "Ta~step*" Example : n=12
   * [0, 2, 4, 6, 8, 10] return "-T0~2*" and detached list Example : n=12 [0, 3]
   * return "" and no action on list
   *
   * @param {Map<string, number[]>} mt (mutable here) Map key = multiplication arg, value = translation values
   *
   * @param {string} nameOp key string value (example : M2)
   * @return String reduce name and reduce list mt.get(nameOp) or detached string and same list
   */
  tryReduceListByShortName(mt: Map<string, number[]>, nameOp: string) {
    let listOfa = mt.get(nameOp) ?? []
    let shortName = "";
    if (listOfa.length > 1) {
      // get n for modulo below
      let n = this.operations[0].n;

      let step = listOfa[1] - listOfa[0];
      let cpt = 1;
      for (let i = 1; i < listOfa.length; i++) {
        if ((listOfa[i] % step) === 0) {
          cpt++
        }
      }
      if (cpt * step === n) {
        shortName = "-T" + listOfa[0] + "~" + step + "*";
        // delete multiple of step element of the list
        let racineValue = listOfa[0];
        listOfa.shift()
        listOfa = listOfa.filter(a => ((a - racineValue) % step) !== 0)
      }
    }
    // replaceBy new value associate to nameOp key
    mt.set(nameOp, listOfa)
    return shortName;
  }


  /**
   * get if set operations is subset of this
   * @param {MusaicPcsOperation[]} ops array of MusaicPcsOperation
   * @return {boolean} true if ops in this.operations
   */
  isInclude(ops: MusaicPcsOperation[]): boolean {
    let isInclude = true;
    ops.forEach(op => {
      if (!this.operations.find(o => o.equals(op))) {
        isInclude = false;
      }
    });
    return isInclude;
  }


  get isMotifEquivalence() {
    return this.getName().includes("M1-T1")
  }

}
