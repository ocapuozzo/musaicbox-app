/*
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
import {IPcs, negativeToPositiveModulo} from "./IPcs";
import {Orbit} from "./Orbit";


/**
 * musaic operation group : c . ((ax + t) modulo n)
 *
 * where 'a' is prime with n,  'x' a PC (for all PCs in a PCS given), 't' step of transposition, 'c' is
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
   * @param n number dimensional vector
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
   * (c,a,t) (c',a',t') = ( c xor c', aa', at' + t)
   * </pre>
   * where :
   * <ul>
   * <li>c is boolean (complement or not) </li>
   * <li>a is integer prime with n </li>
   * <li>t is integer into [0..n[ </li>
   * </ul>
   * Important remark : Where complement is false, op is denoted MA-Tk, else CMA-TK, so neutral operation is M1-TO
   *    whatever op :
   * -   M1-T0.compose(M1-T0)   -> M1-T0  (false !== false) => false
   * -  CM1-T0.compose(M1-T0)  -> CM1-T0 (true !== false) => true
   * -  CM1-T0.compose(CM1-T0) -> M1-T0  (true !== true) => false
   *
   * @param  other MusaicOperation (c',a',t')
   * @return MusaicOperation (this.c,this.a,this.t) (c',a',t') = ( c xor c', aa', at' + t) (a new instance)
   */
  compose(other: MusaicOperation): MusaicOperation {
    if (this.n !== other.n)
      throw new Error("MusaicOperation MusaicGroup Exception bad N in compose op : " + this.n + " !== " + other.n);

    return new MusaicOperation(
      this.n,
      (this.a * other.a) % this.n,
      (this.a * other.t + this.t) % this.n,
      this.complement !== other.complement // logical xor
    )
  }

  /**
   * action on a IPcs is define by
   * <pre>
   *   is this action is complemented
   *     return complement(affineOperation(pcs))
   *   else
   *     return affineOperation(pcs)
   * </pre>
   * @param pcs IPcs
   * @return a new IPcs
   */
  actionOn(pcs: IPcs) {
    return this.complement ? MusaicOperation.affineOp(pcs, this.a, this.t).complement() : MusaicOperation.affineOp(pcs, this.a, this.t);
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
      w2 = op1.n; // assume op1 & op2 having same n

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
   *
   * other : M1-T0 M7-T0 M5-T8 M11-T8
   *       : M1-T0 M5-T0 M7-T6 M11-T6
   */
  static compareStabMajorTMinorA(op1: MusaicOperation, op2: MusaicOperation): number {
    let w1 = op1.t;
    let w2 = op2.t;

    let comp = w1 - w2

    if (comp === 0) {
      if (op1.complement)
        w1 = op1.n;
      if (op2.complement)
        w2 = op1.n; // assume op1 & op2 having same n

      comp = (w1 + op1.a) - (w2 + op2.a);
    }

    return comp;
  }

  compareTo(other: MusaicOperation) {
    return MusaicOperation.compare(this, other)
  }

  addFixedPcs(pcs: IPcs) {
    if (!this.fixedPcs.find(p => p.id === pcs.id)) {
      this.fixedPcs.push(pcs);
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

  /**
   * Convert name of MusaicOperation in instance of MusaicOperation
   * ex: "M1-T0" => instance of MusaicOperation
   * @param opName string representation of MusaicOperation
   * @param n number > 2
   * @return instance of MusaicOperation
   */
  static convertStringOpToMusaicOperation(opName: string, n = 12) {
    const complement = opName.charAt(0) === 'C';
    const indexCaret = opName.indexOf("-")

    if (indexCaret === -1) {
      throw Error(`Convert ${opName} to MusaicOperation impossible`)
    }

    const a = (complement)
      ? parseInt(opName.substring(2, indexCaret))
      : parseInt(opName.substring(1, indexCaret))

    const k = parseInt(opName.substring(indexCaret + 2))

    if (Number.isNaN(k) || Number.isNaN(a)) {
      throw Error(`Convert ${opName} to MusaicOperation impossible`)
    }

    return new MusaicOperation(n, a, k, complement)
  }

  /**
   * Convert names of MusaicOperation in array of MusaicOperation
   * ex: ["M1-T0", "CM5-T5"] => array of 2 instances of MusaicOperation
   * @param n
   * @param stringMusaicOperations array of stringRepresentation of MusaicOperation
   * @return {MusaicOperation[]} array of instances of MusaicOperation
   */
  static convertArrayStringsToArrayOfMusaicOperations(n: number, stringMusaicOperations: string[]): MusaicOperation[] {
    let resultOperations: MusaicOperation[] = []
    stringMusaicOperations.forEach(
      opName => {
        resultOperations.push(this.convertStringOpToMusaicOperation(opName, n))
      })
    return resultOperations
  }

  //

  /**
   * Transformation affine of this
   * @param pcs
   * @param a
   * @param t
   * @returns {IPcs}
   */
  static affineOp(pcs: IPcs, a: number, t: number): IPcs {
    return MusaicOperation.permute(pcs, a, t)
    // let pcsPermuted =  MusaicOperation.permute(pcs, a, t)
    // const pivot = pcsPermuted.iPivot
    //   if (pcs.orbit?.groupAction) {
    //     pcsPermuted = pcs.orbit.groupAction.getIPcsInOrbit(pcsPermuted)
    //     if (pcsPermuted.iPivot !== pivot) {
    //       pcsPermuted = pcsPermuted.cloneWithNewPivot(pivot)
    //     }
    //   }
    // return pcsPermuted
  }

  /**
   * Transposition of this, in n
   * @param pcs
   * @param t step
   * @returns {IPcs}
   */
  static transposition(pcs: IPcs, t: number): IPcs {
    return this.affineOp(pcs, 1, t)
  }

  /**
   * general transformation : affine operation ax + t
   * general idea (composition of affine operations):
   *  1/ translate :        - iPivot
   *  2/ affine operation : ax + t
   *  3/ translate :        + iPivot
   *  so : ax + ( -(a-1) * iPivot + t ) (for each pc in pcs)
   *
   *  If pcs is mapped (nMapping > n) then there is primacy of templateMapping over vectorPcs
   *
   * @param pcs
   * @param  a : number   {number}
   * @param  t : number   [0..11]
   * @return IPcs
   */
  static permute(pcs: IPcs, a: number, t: number): IPcs {
    if (pcs.cardinal === 0) {
      // empty set pcs, no change
      return pcs
    }
    let newPivot
    let newVectorPcs: number[]
    let newTemplateMapping: number[]

    if (pcs.nMapping > pcs.n && a > 1) {
      // example :
      //  n=7 vectorPcs = [0 2 4]
      //  nMapping = 12 templateMapping = [0,2,4,5,7,9,11]
      //  mapped on [0 4 7]
      //  op = M11-T0
      // this.mappedVectorPcs takes over this.vectorPcs
      // this operation act on this.mappedVectorPcs, so templateMapping will also change

      newPivot = negativeToPositiveModulo(((pcs.getMappedPivot() ?? 0) + t), pcs.nMapping)
      // newPivot = negativeToPositiveModulo(((pcs.iPivot ?? 0) + t), pcs.nMapping)

      let currentTemplateMapping = pcs.templateMapping
      //"convert" currentTemplateMapping to currentVectorTemplateMapping  = [0,2,4,5,7,9,11] => [1,0,1,0,1...]
      let currentVectorTemplateMapping = new Array<number>(pcs.nMapping).fill(0)
      for (let i = 0; i < currentTemplateMapping.length; i++) {
        currentVectorTemplateMapping[currentTemplateMapping[i]] = 1
      }
      // [0,2,4,5,7,9,11] => [1,0,1,0,1,1,0,1,0,1,0,1]
      // currentVectorTemplateMapping is binary version of templateMapping

      // permute currentVectorTemplateMapping
      const permutedVectorTemplateMapping
        = this.getVectorPcsPermuted(a, t, newPivot, currentVectorTemplateMapping)
      // M11 * [1 0 1 0 1 1 0 1 0 1 0 1] =>  [1 1 0 1 0 1 0 1 1 0 0 1 0]  ([0 1 3 5 7 8 10])

      // inverse convert action, that begin permutedVectorTemplateMapping becomes new template mapping
      newTemplateMapping = permutedVectorTemplateMapping.reduce(IPcs.vector2integerNamePcs, [])
      // so currentTemplateMapping become newTemplateMapping : [0 1 3 5 7 8 10]
      // [1 1 0 1 0 1 0 1 1 0 0 1 0] => [0 1 3 5 7 8 10]

      // Resume : M11 * [0,2,4,5,7,9,11] => [0 1 3 5 7 8 10]

      // do same operation with pcs.getMappedVectorPcs() [1 0 0 0 1 0 0 1 0 0 0 0] or [0 4 7]
      let newPermutedMappedVectorPcs = this.getVectorPcsPermuted(a, t, newPivot, pcs.getMappedVectorPcs())
      // M11 * [0 4 7] => [0 5 8] [1 0 0 0 0 1 0 0 1 0 0 0]

      // now convert inverse mapping [1 0 0 0 0 1 0 0 1 0 0 0] nMapping to n
      // each index of newPermutedMappedVectorPcs where value is 1 belongs to newTemplateMapping
      // because both are synchronized by same transformation operation M11
      newVectorPcs = new Array<number>(pcs.n).fill(0)
      for (let i = 0; i < newPermutedMappedVectorPcs.length; i++) {
        if (newPermutedMappedVectorPcs[i] === 1) {
          newVectorPcs[newTemplateMapping.indexOf(i)] = 1
        }
      }
      // [1 0 0 0 0 1 0 0 1 0 0 0] => [1 0 0 1 <== this index (3) is index of 5 in newTemplateMapping
      // [1 0 0 0 0 1 0 0 1 0 0 0] => [1 0 0 1 0 1 0]
      //

      // not get new image of pivot (because templateMapping has been changed)
      newPivot = newTemplateMapping.indexOf(newPivot)

      // we have defined : newPivot, newVectorPcs and newTemplateMapping
    } else {
      // no mapping
      // if there is a transposition, then the pivot follows it.
      newPivot = negativeToPositiveModulo(((pcs.iPivot ?? 0) + t), pcs.vectorPcs.length)
      newVectorPcs = this.getVectorPcsPermuted(a, t, newPivot, pcs.vectorPcs)
      newTemplateMapping = pcs.templateMapping
    }
    // now make operation act
    //
    let pcsMappedPermuted = new IPcs({
      vectorPcs: newVectorPcs,
      n: pcs.n,
      templateMapping: newTemplateMapping,
      nMapping: pcs.nMapping,
      iPivot: newPivot,
      orbit: new Orbit() // will maybe be changed, see below
    })

    if (pcs.orbit?.groupAction) {
      pcsMappedPermuted = pcs.orbit.groupAction.getIPcsInOrbit(pcsMappedPermuted)
    }
    return pcsMappedPermuted
  }

  /**
   * general transformation from affine operation ax + t, but fixed on pivot (see "fixed zero problem" in doc)
   * Version by permutation.
   * general idea (composition of basic affine operations):
   *  1/ translate :        - pivot
   *  2/ affine operation : ax + t
   *  3/ translate :        + pivot
   *  so : ax + ( -(a-1) * pivot + t )
   *  so : ax + pivot * (1 - a) + t
   *
   * @see analysis/documentation : affPivot function
   *
   * @param  a : number
   * @param  t : number  [0..this.n[
   * @param pivot : number [0..this.n[
   * @param vectorPcs : number[] array of int
   * @return {number[]}
   */
  static getVectorPcsPermuted(a: number, t: number, pivot: number, vectorPcs: number[]): number[] {
    let vectorPcsPermuted = vectorPcs.slice()
    const n = vectorPcs.length
    let j
    for (let i = 0; i < n; i++) {
      // focus on algebra expression affine extend with manage pivot  : ax + pivot(1 - a) + k)
      // ax + pivot(1 - a) + k)
      // = ax + pivot(1 - a) + t
      // = a*x - a*pivot + pivot  + t
      // a * (x - pivot) + pivot  + t // <= 1 multiplication 1 subtraction 2 add : best implementation
      //
      // Let's take an example :
      //
      // array-in :  [...,    c, d,  e,  f,  g,  h  ,....]
      //              0,1,... 8, 9, 10, 11, 12, 13, ...
      //                             ^
      //  Example : array-in[10] == "e"
      //
      //  if t = +2, array-out[10] becomes "c"
      //
      // array-out :  [...,           c,  d,  e,  f,  g,  h,....]
      //               0,1,... 8,  9, 10, 11, 12, 13, ...
      //                               ^
      //  if t = +2,  element "e" at index 10 becomes "c" (index of c = index of e - t)
      //                                                                           ^
      // this is why, in permutation act, plus t became minus t at end of expression : [...] + t)  =>  [...] - t)
      //
      // j =  a (x - pivot) + pivot + t
      //
      // (below i = x,  where index and pitch class are "merged" :))
      //   @see whats_wrong_with_operations in documentation

      j = (n + (a * (i - pivot) + pivot - t) % n) % n

      // first j modulo n may be negative... so twice modulo : (n + ( j modulo n )) modulo n
      // @see https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
      vectorPcsPermuted[i] = vectorPcs[j]
    }
    return vectorPcsPermuted
  }


  /**
   * get complement of this.
   * Important : complement loses iPivot
   * @return {IPcs} a new instance (free, not attached to an orbit).
   *
   */
  static complement(pcs: IPcs): IPcs {

    let complementVector: number[] = pcs.vectorPcs.map(pc => (pc === 1 ? 0 : 1)) //;slice() and inverse 0/1

    const newPivot = pcs.getFutureAxialSymmetryPivotForPrepareComplement()

    let pcsComplement = new IPcs({
      vectorPcs: complementVector,
      iPivot: newPivot, // new_iPivot,
      orbit: new Orbit(), // as new pcs, here we don't know its orbit (see note below)
      templateMapping: pcs.templateMapping,
      nMapping: pcs.nMapping
    })

    if (pcs.orbit?.groupAction) {
      pcsComplement = pcsComplement.getOrMakeInstanceFromOrbitOfGroupActionOf(pcs.orbit?.groupAction);
    }
    return pcsComplement

  }

}
