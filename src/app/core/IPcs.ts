/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import { Forte } from './Forte';
import {Orbit} from "./Orbit";

const NEXT_MODULATION = 1
const PREV_MODULATION = 2

const negativeToPositiveModulo = (i: number, n: number): number => {
  return (n - ((i * -1) % n)) % n
}

export class IPcs {
  // pidVal: number = 12;
  // strPcs ?: string = undefined;
  // binPcs ?: number[] = undefined;
  n: number = 12;
  iPivot?: number = undefined;
  pcs: number[];
  orbit: any; //TODO
  id: number;
  private _minCyclic ?: IPcs;
  private _cardModesOrbits ?: number
  is : number[]

  constructor(
    {pidVal, strPcs, binPcs, n, iPivot}:
      {
        pidVal?: number, strPcs?: string, binPcs?: number[], n?: number, iPivot?: number
      } = {}) {
    if (pidVal !== undefined && pidVal >= 0) {
      this.pcs = IPcs.intToBinArray(pidVal, n ?? 12)
    } else if (strPcs !== undefined) {
      this.pcs = this._fromStringTobinArray(strPcs, n)
    } else if (Array.isArray(binPcs)) {
      // assume pcs bin vector [1,0,1, ... ]
      this.pcs = binPcs.slice()
    } else {
      throw new Error("Can't create IPcs instance (bad args = " + strPcs + ")")
    }
    // empty set as valid pcs
    if (this.cardinal() === 0) {
      this.iPivot = undefined
    } else if (!iPivot && iPivot !== 0) {
      // iPivot is min pc
      this.iPivot = this.pcs.findIndex((pc => pc === 1))
    } else {
      // check iPivot in pcs
      if (this.pcs[iPivot] === 1) {
        this.iPivot = iPivot
      } else {
        throw new Error("Can't create IPcs instance (bad iPivot = " + iPivot + " for pcs " + this.pcs + ")")
      }
    }
    this.n = this.pcs.length
    this.orbit = new Orbit()
    this.id = IPcs.id(this.pcs)
    this.is = this._is()
  }

  /**
   * bin array image of PCS string
   * Example : "0, 1, 7" => [1,1,0,0,0,0,0,1,0,0,0,0] (default n = 12)
   * Example : "0, 1, 3", 5 => [1,1,0,1,0] (n = 5)
   *
   * @param {string} strpcs
   * @param {number} n vector dimension
   * @returns {int[]} vector (length == n)
   */
  _fromStringTobinArray(strpcs: string, n = 12): Array<number> {
    // assume length = 12
    let bin = new Array(n).fill(0);

    //  if "[1,3,5]" => "1,3,5"
    //  if "{1,3,5}" => "1,3,5"
    if ((strpcs[0] === '[' && strpcs[strpcs.length - 1] === ']') ||
      (strpcs[0] === '{' && strpcs[strpcs.length - 1] === '}')) {
      strpcs = strpcs.substring(1, strpcs.length - 1);
    }
    if (strpcs) {
      let pitches = strpcs.split(',');
      for (let i = 0; i < pitches.length; i++) {
        bin[Number(pitches[i])] = 1;
      }
    }
    return bin;
  }

  /**
   * Convert integer in binary pitches class set
   *
   * @param intpcs
   *           integer value to convert
   * @param dim
   *           vector length
   *
   * @return {Array} (binary pitches class set)
   */
  static intToBinArray(intpcs: number, dim: number) {
    let pitchesArray: number[] = []
    pitchesArray.length = dim;
    pitchesArray.fill(0);
    for (let i = 0; i < dim && intpcs > 0; i++, intpcs = Math.floor(intpcs / 2)) {
      pitchesArray[i] = intpcs % 2;
    }
    return pitchesArray;
  }

  static get NEXT_MODULATION() {
    return NEXT_MODULATION
  }

  static get PREV_MODULATION() {
    return PREV_MODULATION
  }

  /**
   * int identify of PCS Bin Array representtion (abin)
   *  function polynomial (bijective function)
   * @param {array} abin
   * @returns {number}
   */
  static pid(abin: number[]) {
    let n = abin.length;
    let res = 0;
    let pow = 1;
    let card = 0;
    for (let i = 0; i < n; i++) {
      res += abin[i] * pow;
      pow *= 2;
      if (abin[i] === 1)
        card++;
    }
    return res;
  }

  /**
   * int identify of PCS Bin Array representtion (abin)
   *  is function polynomial + 2^12 * cardinal
   *   for order relation (select min with weight cardinal)
   * @param {array} abin
   * @returns {number}
   */
  static id(abin: number[]) {
    let n = abin.length;
    let res = 0;
    let pow = 1;
    let card = 0;
    for (let i = 0; i < n; i++) {
      res += abin[i] * pow;
      pow *= 2;
      if (abin[i] === 1)
        card++;
    }
    return res + card * (1 << n);
    //return res + ((int) Math.pow(2, dim)) * card;
  }

  //
  // get id() {
  //   if (! this.#_id) {
  //     this.#_id = IPcs.id(this.pcs);
  //   }
  //   return this.#_id;
  // }

  pid() {
    return IPcs.pid(this.pcs);
  }

  /**
   * return this by transpose iPivot to zero
   * @return {IPcs}
   */
  modalPrimeForm() {
    // if iPivot is undefined or already equals to zero, return this
    if (!this.iPivot) {
      return this
    }
    return this.transpose(-this.iPivot)
  }

  /**
   * Get cyclic PF
   *
   * @return IPcs
   */
  cyclicPrimeForm() {
    if (this.cardinal() === 0) {
      return this
    }
    if (this._minCyclic) {
      return this._minCyclic
    }
    // lazy compute
    let n = this.pcs.length;
    let norm: number[] = this.pcs.slice();
    let min = norm;
    let minInt = IPcs.id(this.pcs);

    for (let i = 0; i < n - 1; i++) {
      norm = IPcs.getPermute(1, 1, 0, norm);
      let curInt = IPcs.id(norm);
      if (minInt > curInt) {
        minInt = curInt;
        min = norm;
      }
    }
    this._minCyclic = new IPcs({binPcs: min, iPivot: 0})
    return this._minCyclic
  }

  dihedralPrimeForm() {
    let cpf = this.cyclicPrimeForm();
    let pcsM11 = cpf.affineOp(11, 0).cyclicPrimeForm();
    return cpf.id < pcsM11.id ? cpf : pcsM11;
  }

  affinePrimeForm() {
    let cpf = this.dihedralPrimeForm();
    let pcsM5 = cpf.affineOp(5, 0).cyclicPrimeForm();
    let pcsM7 = cpf.affineOp(7, 0).cyclicPrimeForm();

    if (cpf.id < pcsM5.id && cpf.id < pcsM7.id)
      return cpf

    if (pcsM5.id < pcsM7.id)
      return pcsM5

    return pcsM7
  }

  musaicPrimeForm() {
    let cpf = this.affinePrimeForm();
    let cpfCplt = cpf.complement().affinePrimeForm();
    return cpf.id < cpfCplt.id ? cpf : cpfCplt;
  }

  /**
   * general transformation : affine operation ax + t
   * general idea (composition of affine operations):
   *  1/ translate :        1 + -iPivot
   *  2/ affine operation : ax + t
   *  3/ translate :        1 + iPivot
   *  so : ax + ( -(a-1) * iPivot + t )
   * @param  a    : number
   * @param  t  :number  [0..this.n[
   * @param iPivot : number [0..this.n[
   * @param abin : number[] array of int
   * @return {number[]}
   */
  static getPermute(a: number, t: number, iPivot: number, abin: number[]) {
    let permute = abin.slice()
    let n = abin.length
    let j
    if (t < 0) {
      t = negativeToPositiveModulo(t, n)
      // t in [0..n[
    }
    for (let i = 0; i < n; i++) {
      j = (n + (((i * a) - (a - 1) * iPivot - t) % n)) % n
      // j may be negative... so n + (...) modulo n
      permute[i] = abin[j]
    }
    return permute
  }

  /**
   * general transformation : affine operation ax + t
   * general idea (composition of affine operations):
   *  1/ translate :        1 + -iPivot
   *  2/ affine operation : ax + t
   *  3/ translate :        1 + iPivot
   *  so : ax + ( -(a-1) * iPivot + t ) (for each pc in pcs)
   * @param  a : number   {number}
   * @param  t : number   [0..11]
   * @return IPcs
   */
  permute(a: number, t: number): IPcs {
    if (this.cardinal() === 0) {
      // empty pcs no change
      return this
    }
    // @ts-ignore
    let newPivot = negativeToPositiveModulo((this.iPivot + t), this.pcs.length)
    return new IPcs({binPcs: IPcs.getPermute(a, t, newPivot, this.pcs), iPivot: newPivot})
  }

  /**
   * Transformation affine of this
   * @param a
   * @param t
   * @returns {IPcs}
   */
  affineOp(a: number, t: number): IPcs {
    return this.permute(a, t)
  }

  /**
   * Transpose of this
   * @param t
   * @returns {IPcs}
   */
  transpose(t: number) {
    return this.affineOp(1, t)
  }

  /**
   * Modulate of this (change iPivot)
   * @param direction which next or previus degree of modulation
   * @returns {IPcs} a new object
   *
   * TODO : set new iPivot nearest
   */
  modulate(direction: number) {
    let newiPivot = this.iPivot
    let pivot: number = this.iPivot ?? 0
    if (direction === IPcs.NEXT_MODULATION) {
      let n = this.pcs.length
      for (let i = pivot + 1; i < n + pivot; i++) {
        if (this.pcs[i % n] === 1) {
          newiPivot = i % n
          break
        }
      }
    } else if (direction === IPcs.PREV_MODULATION) {
      let n = this.pcs.length
      let i = pivot - 1
      if (i < 0) {
        i = negativeToPositiveModulo(i, n)
      }
      for (; i !== pivot;) {
        if (this.pcs[i] === 1) {
          newiPivot = i
          break
        }
        i--
        if (i < 0) {
          i = negativeToPositiveModulo(i, n)
        }
      }
    }
    return new IPcs({binPcs: this.pcs.slice(), iPivot: newiPivot})
  }

  /**
   * string image of PCS from bin array
   * Example : [1,1,0,0,0,0,0,1,0,0,0,0] => "[0, 1, 7]"
   * @returns {string}
   */
  get pcsStr() {
    let res = "";
    for (let index = 0; index < this.pcs.length; index++) {
      const element = this.pcs[index];
      if (element)
        res = (res) ? res + ',' + index.toString() : index.toString();
    }
    return '[' + res + ']';
  }

  getForteNum() {
    let cpf = this.cyclicPrimeForm();
    // console.log("cpf :" + cpf);
    let fortenum = Forte.forte(cpf.pcsStr);
    // console.log("fortenum :" + fortenum);
    if (fortenum) {
      return fortenum;
    }
    let dpcsf = cpf.dihedralPrimeForm();
    // console.log("dpcsf : " + dpcsf);
    // console.log("dpcsf : " + dpcsf.pcsStr);

    return Forte.forte(dpcsf.pcsStr);
  }

  /**
   * Change iPivot and set 1 to this index
   * @param iPivot
   */
  setiPivot(iPivot: number) {
    this.pcs[iPivot] = 1;
    this.iPivot = iPivot;
  }

  /**
   * intervallic structure
   * @see http://architexte.ircam.fr/textes/Andreatta03e/index.pdf
   * @see https://sites.google.com/view/88musaics/88musaicsexplained
   * @returns {int[]}
   *
   * Example : is("0,3,7") => [3,4,5]
   * Example : is( "1,5,8", iPivot:5) > [3, 5, 4]
   * Example : is( "1,5,8", iPivot:1) > [4, 3, 5]
   */
  _is() {
    let n = this.n;
    let res = []
    for (let i = 0; i < n; i++) {
      // @ts-ignore
      if (this.pcs[(i + this.iPivot) % n] === 1) {
        let j;
        for (let k = 0; k < n; k++) {
          j = (k + i + 1) % n
          // @ts-ignore
          if (this.pcs[(j + this.iPivot) % n] === 1) {
            // offset iPivot is not necessary
            res.push((n + j - i) % n)
            break
          }
        }
      }
    }
    return res;
  }


  /**
   * interval vector (generalized on n, from musaicbox java)
   * @see https://en.wikipedia.org/wiki/Common_tone_(scale)#Deep_scale_property
   * @returns {int[]}
   *
   * Example : iv("0,3,7") => [0,0,1,1,1,0]
   */
  iv() {
    let n = this.pcs.length;
    let res = new Array(n / 2 + n % 2);
    let max = n / 2;
    let v = 0;
    for (let i = 0; i < max; i++) {
      res[i] = 0;
      v++;
      for (let j = 0; j < n; j++) {
        if (this.pcs[j] === 1 && this.pcs[(j + v) % n] === 1)
          res[i] = res[i] + 1;
      }
    }
    // div last value by 2 (n==12)
    res[res.length - 1] /= 2;
    return res;
  }

  /**
   * get number of pitches of this
   * @return Number
   */
  cardinal() {
    return this.pcs.filter(i => i === 1).length
  }

  /**
   * get cardinal of all modes
   * Examples :
   * <pre>
   * { 0, 3, 6, 9} => 1
   * { 0, 4, 8} => 1
   * { 0, 1, 6, 7} => 2
   * { 0, 1, 2, 3} => 4
   * </pre>
   * @return {number}
   */
  cardOrbitMode() {
    if (this.iPivot === undefined) {
      return undefined
    }
    if (this._cardModesOrbits) {
      return this._cardModesOrbits // _modesOrbits.length
    }
    // lazy loading
    let modesOrbits = []
    modesOrbits.push(this)
    let cardinal = 0;
    let pcs = this.pcs.slice()
    let n = pcs.length
    for (let i = (this.iPivot + 1) % n; i < pcs.length + this.iPivot; i++) {
      if (pcs[i % n] === 0) continue
      cardinal++
      let ipcs2 = this.transpose(-i + this.iPivot)
      // compareTo pcs without iPivot
      if (ipcs2.equalsPcs(this)) {
        break
      } else {
        modesOrbits.push(ipcs2)
      }
    }
    return this._cardModesOrbits = modesOrbits.length
  }

  /**
   * get number of distinct PCS in cyclic orbit of PCS.
   *  formula derived from equality in these two ratios  : n/cardOrbitCyclic and cardinalPcs/cardOrbitMode
   * @return {number}
   */
  cardOrbitCyclic() {
    let n = this.pcs.length
    // TODO à vérifier en cas cardOrbitMode undefined...
    let cardOrbit = this.cardOrbitMode() ?? 0
    return (n * cardOrbit) / this.cardinal()
  }

  /**
   * get complement of this.
   * Important : complement loses iPivot pivot
   */
  complement() {
    let pcs_cpt = this.pcs.map(pc => (pc === 1 ? 0 : 1)) //;slice() and inverse 0/1
    let new_iPivot = undefined
    let actualiPivot = this.iPivot ?? 0
    let n = pcs_cpt.length
    // iPivot is lost by complement... set a new iPivot of complement
    // opposite is a good candidate when n is even
    if (/*actualiPivot === undefined &&*/ pcs_cpt[0] === 1) {
      new_iPivot = 0
    } else if ((n % 2) === 0 && pcs_cpt[(actualiPivot + n / 2) % n] === 1) {
      new_iPivot = (actualiPivot + n / 2) % n
    } else {
      // TODO best strategy to find new iPivot
      // here the first in right circular research
      for (let i = actualiPivot + 1; i < actualiPivot + n; i++) {
        if (pcs_cpt[i % n] === 1) {
          new_iPivot = i % n
          break
        }
      }
    }

    return new IPcs({binPcs: pcs_cpt, iPivot: new_iPivot})
  }

  toString() {
    return JSON.stringify(this.pcs) + ", iPivot : "
      + JSON.stringify(this.iPivot)
    //	return JSON.stringify(this);
  }

  equals(other: any) {
    if (other instanceof IPcs) {
      return this.pcs.every((v, i) => v === other.pcs[i]) &&
        this.iPivot === other.iPivot;
    }
    return false
  }

  equalsPcs(other: any) {
    if (other instanceof IPcs) {
      return this.pcs.every((v, i) => v === other.pcs[i])
    }
    return false
  }

  /**
   *
   * @param ipcs1
   * @param ipcs2
   * @return {number} as waiting by Array sort
   */
  static compare(ipcs1: IPcs, ipcs2: IPcs) : number {
    return ipcs1.id - ipcs2.id
  }

  /**
   *
   * @param {IPcs} ipcs2 to compareTo
   * @return {number} as waiting by Array sort
   */
  compareTo(ipcs2 : IPcs): number {
    return IPcs.compare(this, ipcs2)
  }

  addInOrbit(newIPcs: IPcs) {
    this.orbit.addIPcsIfNotPresent(newIPcs)
  }

  /**
   *
   * @param {number} ipitch
   * @param {array} arrResearchA (to optimise - avoid create local array)
   * @param {array} arrResearchB (to optimise - avoid create local array)
   */
  axeSymmetry(ipitch:number, arrResearchA:number[], arrResearchB:number[]): number {
    let iAxe
    let symmetryMedian = 1;
    let nEven = this.n % 2 === 0;
    let symmetryIntercalare = nEven ? 10 : 0
    // param arrResearchA & B passed for performance
    // instanced by caller
    arrResearchA.fill(0)
    arrResearchB.fill(0)
    let right = ipitch; // start research
    let left = ipitch; //
    let middle = Math.round(this.n / 2) + 1
    for (iAxe = 0; iAxe < this.n; iAxe++) {
      if (this.pcs[right] === 1)
        arrResearchA[iAxe] = 1; // { in one way }
      if (this.pcs[left] === 1)
        arrResearchB[iAxe] = 1; // { other way }
      right = (right + 1) % this.n;
      if (left === 0) left = this.n;
      left--;
    }
    // compare
    for (iAxe = 0; iAxe < middle; iAxe++) {
      if (arrResearchA[iAxe] !== arrResearchB[iAxe])
        symmetryMedian = 0;
      if (nEven && arrResearchB[iAxe] !== arrResearchA[(iAxe + 1) % this.n]) {
        symmetryIntercalare = 0;
      }
    }
    return symmetryMedian + symmetryIntercalare // 0, 1, 10 or 11
  }

  /**
   * Get axial symmetries
   *
   * @return {object}
   */
  getAxialSymmetries() {
    let symMedian = Array(this.n)
    let symInter = Array(this.n)
    symMedian.fill(0)
    symInter.fill(0);

    const MEDIAN = 1;
    const INTERCAL = 10;
    const MEDIAN_INTERCAL = 11;

    let nEven = this.n % 2 === 0;
    let imax = nEven ? Math.round(this.n / 2) : this.n;

    let tempA = Array(this.n);
    let tempB = Array(this.n);
    for (let i = 0; i < imax; i++) {
      let typeAxe = this.axeSymmetry(i, tempA, tempB);
      switch (typeAxe) {
        case MEDIAN:
          symMedian[i] = 1;
          break;
        case INTERCAL:
          symInter[i] = 1;
          break;
        case MEDIAN_INTERCAL: // pcs empty n even
          symMedian[i] = 1;
          symInter[i] = 1;
          break;
      }
    }
    return {
      symMedian: symMedian,
      symInter: symInter
    }
  }
}
