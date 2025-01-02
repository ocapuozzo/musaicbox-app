/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

/**
 * musaic operation group : ((ax + t) modulo n) . c
 *
 * where 'a' is prime with n,  'x' a PCS (all PCs in x), 't' step of transposition, 'c' is
 * complement operation which can be : neutral operation or complement operation
 * so 'c' is boolean representation with composition operation is XOR
 * <table>
 * <tr>
 * <td></td>
 * <td>notCplt</td>
 * <td>Cplt</td>
 * </tr>
 * <tr>
 * <td>notCplt</td>
 * <td>id</td>
 * <td>Cplt</td>
 * </tr>
 * <tr>
 * <td>Cplt</td>
 * <td>Cplt</td>
 * <td>id</td>
 * </tr>
 * </table>
 *
 * @author kpu
 *
 */

import {StringHash} from "../utils/StringHash";
import {IPcs} from "./IPcs";

export class MusaicOperation {
  a: number
  t: number
  n: number
  complement: boolean
  _strRepr: string
  _strReprWithoutTransp: string
  fixedPcs: IPcs[]
  //stabilizers: Stabilizer[]
  _hashcode ?: number

  /**
   *  ((ax + t) modulo n) . c
   *
   * @param n number dimension vector
   * @param a number coef mult
   * @param t number transposition value
   * @param complement boolean
   */
  constructor(n: number, a: number, t: number, complement = false) {
    this.a = a;
    this.t = t;
    this.n = n;
    this.complement = complement;
    let prefix = this.complement ? "C" : "";
    this._strRepr = prefix + "M" + this.a + "-T" + this.t; // n ? generally used into same Zn
    this._strReprWithoutTransp = prefix + "M" + a;
    this.fixedPcs = []  // new ArrayList<Pcs>();
  //  this.stabilizers = [] // new ArrayList<Stabilizer>();
    this.getHashCode()
  }

  _makeHashCode() {
    return StringHash.stringHashCode(this._strRepr)
  }

  equals(obj: any) {
    if (this === obj)
      return true;
    if (obj === null)
      return false;
    if (!(obj instanceof MusaicOperation))
      return false;

    let other: MusaicOperation = obj;

    if (this.n !== other.n)
      return false;
    if (this.a !== other.a)
      return false;
    if (this.complement !== other.complement)
      return false;

    return this.t === other.t;

  }

  /**
   * Use for generate all operations from a subset of operations, inspired by Cayley
   * table algorithm : get a new operation by Law of composition of MusaicGroup :
   * <pre>
   * (a,t,c) (a',t',c') = (aa', at' + t, c xor c')
   * </pre>
   * where :
   * <ul>
   * <li>a is integer prime with n </li>
   * <li>t is integer into [0..n[ </li>
   * <li>c is boolean (complement or not) </li>
   * </ul>
   * Important remark : Neutral operation is M1-TO (complement == false else CM1-TO)
   *    whatever op :
   *    M1-T0.compose(M1-T0) == M1-T0   (false !== false) => false
   *    CM1-T0.compose(M1-T0) == CM1-T0 (true !== false) => true
   *
   * @param  other MusaicOperation (a',t',c')
   * @return MusaicOperation (this.a,this.t,this.c) (a',t',c') = (aa', at' + t, c xor c'), a new instance
   */
  compose(other: MusaicOperation) : MusaicOperation {
    if (this.n !== other.n)
      throw new Error("MusaicOperation MusaicGroup Exception bad N in compose op : " + this.n  + " !== " + other.n);

    return new MusaicOperation(
      this.n,
      (this.a * other.a) % this.n,
      (this.a * other.t + this.t) % this.n,
      this.complement !== other.complement)  // logical xor
  }

  /**
   * action on a IPcs is define by
   * <pre>
   *   is this action is complemented
   *     return complement(affineOperation(pcsList))
   *   else
   *     return affineOperation(pcsList)
   * </pre>
   * @param ipcs IPcs
   * @return a new IPcs
   */
  actionOn(ipcs: IPcs) {
    return this.complement ? ipcs.affineOp(this.a, this.t).complement() : ipcs.affineOp(this.a, this.t);
  }

  toString() {
    return this._strRepr;
  }

// without transposition op
  toStringWithoutTransp() {
    return this._strReprWithoutTransp;
  }

  /**
   * major sort as M, CM
   *   M1 M5 M7 M11 CM1 CM5 CM7 CM11
   * minor sort as T
   *   M1-T1 M2-T2 ...
   * So:    M1-T3, M1-T0, CM1-T5, M5-T1, CM7-T8, CM7-T3
   * give : M1-T0, M1-T3, M5-T1, CM1-T5, CM7-T3, CM7-T8
   */
  static compare(op1: MusaicOperation, op2: MusaicOperation) {
    let w1 = 0;
    let w2 = 0;
    if (op1.complement)
      w1 = op1.n;
    if (op2.complement)
      w2 = op1.n;

    let comp = (w1 + op1.a) - (w2 + op2.a);

    if (comp === 0) {
      comp = op1.t - op2.t;
    }
    return comp;
  }

  /**
   * major sort as T0, T1, ...
   * minor sort as M1, M11, M5, M5, CM1, CM11, CM5, CM7
   *   M1-T1 M2-T2 ...
   * So:    M1-T3, M1-T0, CM1-T5, M5-T0, CM7-T8, CM7-T3
   * give : M1-T0, M5-T0, M1-T3, CM7-T3, CM1-T5, CM7-T8
   */
  static compareStab(op1: MusaicOperation, op2: MusaicOperation) : number {
    let w1 = op1.t;
    let w2 = op2.t;

    let comp = w1 - w2

    if (comp === 0) {
      if (op1.complement)
        w1 = op1.n;
      if (op2.complement)
        w2 = op1.n;

      comp = (w1 + op1.a) - (w2 + op2.a);
    }

    return comp;
  }

  compareTo(other: MusaicOperation) {
    return MusaicOperation.compare(this, other)
  }

  addFixedPcs(ipcs: IPcs) {
    if (!this.fixedPcs.find(p => p.id === ipcs.id)) {
      this.fixedPcs.push(ipcs);
    }
  }

  getFixedPcs(): IPcs[] {
    return this.fixedPcs;
  }

  getHashCode() {
    if (!this._hashcode) {
      this._hashcode = this._makeHashCode()
    }
    return this._hashcode
  }

  isComplemented() {
    return this.complement
  }

// // test en vue de supprimer  la coll fixedPcs
// // qui est gourmande en mémoire inutule
// // pour que ça marche il faut ajouter une liaison
// // vers les stabilizers ayant cette opération comme stab.
//
// public Set<Pcs> getComputeFixedPcs() {
//   Set<Pcs> fixedPcs = new HashSet<Pcs>();
//   for(Stabilizer stab : stabilizers) {
//     fixedPcs.addAll(stab.getFix().pcsset);
//   }
//   return fixedPcs;
// }

}
