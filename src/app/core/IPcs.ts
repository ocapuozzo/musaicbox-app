/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {Forte} from './Forte';
import {Orbit} from "./Orbit";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";

const NEXT_MODULATION = 1
const PREV_MODULATION = 2

const negativeToPositiveModulo = (i: number, n: number): number => {
  return (n - ((i * -1) % n)) % n
}

export class IPcs {
  readonly n: number;
  iPivot?: number = undefined;
  readonly abinPcs: number[];
  orbit: Orbit; //TODO
  readonly id: number;
  private _minCyclic ?: IPcs;
  private _cardModesOrbits ?: number
  readonly is: number[]
  readonly mappingBinPcs: number[]
  readonly nMapping: number = 0
  private readonly _mappedBinPcs: number[] = []

  constructor(
    {pidVal, strPcs, binPcs, n, iPivot, orbit, mappingBinPcs, nMapping}:
      {
        pidVal?: number,
        strPcs?: string,
        binPcs?: number[],
        n?: number,
        iPivot?: number,
        orbit?: Orbit,
        mappingBinPcs?: number[],
        nMapping?: number
      } = {}) {
    if (pidVal !== undefined && pidVal >= 0) {
      this.abinPcs = IPcs.intToBinArray(pidVal, n ?? 12)
    } else if (strPcs !== undefined) {
      this.abinPcs = this._fromStringTobinArray(strPcs, n)
    } else if (Array.isArray(binPcs)) {
      // assume pcs bin vector [1,0,1, ... ]
      this.abinPcs = binPcs.slice()
    } else {
      throw new Error("Can't create IPcs instance (bad args = " + strPcs + ")")
    }
    // empty set as valid pcs
    if (this.cardinal === 0) {
      this.iPivot = undefined
    } else if (!iPivot && iPivot !== 0) {
      // iPivot is min pc
      this.iPivot = this.abinPcs.findIndex((pc => pc === 1))
    } else {
      // check iPivot in pcs
      if (this.abinPcs[iPivot] === 1) {
        this.iPivot = iPivot
      } else {
        throw new Error("Can't create IPcs instance (bad iPivot = " + iPivot + " for pcs " + this.abinPcs + ")")
      }
    }
    if (n && n !== this.abinPcs.length) {
      throw new Error("Can't create IPcs instance (bad n = " + n + " for pcs " + this.abinPcs + ")")
    }
    this.n = this.abinPcs.length
    this.orbit = orbit ?? new Orbit()
    this.id = IPcs.id(this.abinPcs)
    this.is = this._is()
    this.mappingBinPcs = mappingBinPcs ?? []
    this.nMapping = nMapping ?? 0

    // if mapping, create here bin array mapped of this
    // @see method getReprBinPcs()
    if (this.mappingBinPcs.length > 0 && this.nMapping > this.n) {
      this._mappedBinPcs = new Array<number>(this.nMapping).fill(0)
      for (let i = 0; i < this.mappingBinPcs.length; i++) {
        this._mappedBinPcs[this.mappingBinPcs[i]] = this.abinPcs[i];
      }
    }
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

  static get NEXT_MODULE() {
    return NEXT_MODULATION
  }

  static get PREV_MODULE() {
    return PREV_MODULATION
  }

  /**
   * int identify of PCS Bin Array representation (abin)
   *  function polynomial (bijective function)
   * @param {array} abin
   * @returns {number}
   */
  static pid(abin: number[]): number {
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
   * int identify of PCS Bin Array representation (abin)
   *  is function polynomial + 2^12 * cardinal
   *   for order relation (min include weight of cardinal)
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
    return res + card * (1 << n);  // res + ((int) Math.pow(2, dim)) * card;
  }


  pid() {
    return IPcs.pid(this.abinPcs);
  }

  /**
   * return this by transpose iPivot to zero, useful for analyse (a mode)
   * @return {IPcs}
   */
  modalPrimeForm(): IPcs {
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
    if (this.cardinal === 0) {
      return this
    }
    if (this._minCyclic) {
      return this._minCyclic
    }
    // lazy compute
    if (!this.orbit.empty && this.orbit.groupAction == GroupAction.predefinedGroupsActions(this.n, Group.CYCLIC))
      this._minCyclic = this.orbit.getPcsMin()
    else {
      this._minCyclic = GroupAction.predefinedGroupsActions(this.n, Group.CYCLIC).getOrbitOf(this).getPcsMin()
    }
    // old implementation
    // // lazy compute
    // let n = this.abinPcs.length;
    // let norm: number[] = this.abinPcs.slice();
    // let min = norm;
    // let minInt = IPcs.id(this.abinPcs);
    //
    // for (let i = 0; i < n - 1; i++) {
    //   norm = IPcs.getBinPcsPermute(1, 1, 0, norm);
    //   let curInt = IPcs.id(norm);
    //   if (minInt > curInt) {
    //     minInt = curInt;
    //     min = norm;
    //   }
    // }
    // this._minCyclic = new IPcs({binPcs: min, iPivot: 0})
    return this._minCyclic
  }

  dihedralPrimeForm() {
    if (!this.orbit.empty && this.orbit.groupAction == GroupAction.predefinedGroupsActions(this.n, Group.DIHEDRAL))
      return this.orbit.getPcsMin()
    else {
      return GroupAction.predefinedGroupsActions(this.n, Group.DIHEDRAL).getOrbitOf(this).getPcsMin()
    }
    // old implementation :
    // let cpf = this.cyclicPrimeForm();
    // let pcsM11 = cpf.affineOp(11, 0).cyclicPrimeForm();
    // return cpf.id < pcsM11.id ? cpf : pcsM11;
  }

  affinePrimeForm() {
    if (!this.orbit.empty && this.orbit.groupAction == GroupAction.predefinedGroupsActions(this.n, Group.AFFINE))
      return this.orbit.getPcsMin()
    else {
      return GroupAction.predefinedGroupsActions(this.n, Group.AFFINE).getOrbitOf(this).getPcsMin()
    }
    // let cpf = this.dihedralPrimeForm();
    // let pcsM5 = cpf.affineOp(5, 0).cyclicPrimeForm();
    // let pcsM7 = cpf.affineOp(7, 0).cyclicPrimeForm();
    //
    // if (cpf.id < pcsM5.id && cpf.id < pcsM7.id)
    //   return cpf
    //
    // if (pcsM5.id < pcsM7.id)
    //   return pcsM5
    //
    // return pcsM7
  }

  musaicPrimeForm(): IPcs {
    if (!this.orbit.empty && this.orbit.groupAction == GroupAction.predefinedGroupsActions(this.n, Group.MUSAIC))
      return this.orbit.getPcsMin()
    else
      return GroupAction.predefinedGroupsActions(this.n, Group.MUSAIC).getOrbitOf(this).getPcsMin()
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
   * @param binPcs : number[] array of int
   * @return {number[]}
   */
  static getBinPcsPermute(a: number, t: number, iPivot: number, binPcs: number[]): number[] {
    let binPcsPermuted = binPcs.slice()
    let n = binPcs.length
    let j
    if (t < 0) {
      t = negativeToPositiveModulo(t, n)
      // t in [0..n[
    }
    for (let i = 0; i < n; i++) {
      j = (n + (((i * a) - (a - 1) * iPivot - t) % n)) % n
      // j may be negative... so n + (...) modulo n
      binPcsPermuted[i] = binPcs[j]
    }
    return binPcsPermuted
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
    if (this.cardinal === 0) {
      // empty pcs no change
      return this
    }
    // @ts-ignore
    let newPivot = negativeToPositiveModulo((this.iPivot + t), this.abinPcs.length)
    return new IPcs({
      binPcs: IPcs.getBinPcsPermute(a, t, newPivot, this.abinPcs),
      iPivot: newPivot,
      orbit:this.orbit,
      mappingBinPcs: this.mappingBinPcs,
      nMapping: this.nMapping
    })
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
  transpose(t: number): IPcs {
    return this.affineOp(1, t)
  }

  /**
   * Modulate of this (change iPivot)
   * @param direction which next or previus degree of modulation
   *  Example : { 0, 4, 7 } iPivot=0,  next=> iPivot == 4,  prev=> iPivot == 7
   * @returns {IPcs} a new object
   *
   */
  modulate(direction: number): IPcs {
    let newiPivot = this.iPivot
    let pivot: number = this.iPivot ?? 0
    if (direction === IPcs.NEXT_MODULE) {
      let n = this.abinPcs.length
      for (let i = pivot + 1; i < n + pivot; i++) {
        if (this.abinPcs[i % n] === 1) {
          newiPivot = i % n
          break
        }
      }
    } else if (direction === IPcs.PREV_MODULE) {
      let n = this.abinPcs.length
      let i = pivot - 1
      if (i < 0) {
        i = negativeToPositiveModulo(i, n)
      }
      for (; i !== pivot;) {
        if (this.abinPcs[i] === 1) {
          newiPivot = i
          break
        }
        i--
        if (i < 0) {
          i = negativeToPositiveModulo(i, n)
        }
      }
    }
    return new IPcs({
      binPcs: this.abinPcs.slice(),
      iPivot: newiPivot,
      orbit:this.orbit,
      mappingBinPcs: this.mappingBinPcs,
      nMapping: this.nMapping
    })
  }

  /**
   * string image of PCS from bin array
   * Example : [1,1,0,0,0,0,0,1,0,0,0,0] => "[0, 1, 7]"
   * @returns {string}
   */
  get pcsStr(): string {
    let res = "";
    for (let index = 0; index < this.abinPcs.length; index++) {
      const element = this.abinPcs[index];
      if (element)
        res = (res) ? res + ',' + index.toString() : index.toString();
    }
    return '[' + res + ']';
  }

  /**
   * Get Forte Num of this
   */
  forteNum(): string {
    if (this.n != 12) return ""

    let cpf = this.cyclicPrimeForm();
    let fortenum = Forte.forte(cpf.pcsStr);

    if (fortenum) {
      return fortenum;
    }
    // not found ? get with dihedralPrimeForm
    let dpcsf = cpf.dihedralPrimeForm();

    return Forte.forte(dpcsf.pcsStr);
  }

  /**
   * Change iPivot
   *
   * @param iPivot
   *
   * @return new instance
   */
  getWithNewPivot(iPivot: number): IPcs {
    // exception is catch when bad iPivot (in constructor logic)
    let newBinPcs = this.abinPcs.slice()
    return new IPcs({
      binPcs: newBinPcs,
      n: newBinPcs.length,
      iPivot: iPivot,
      orbit:this.orbit,
      mappingBinPcs: this.mappingBinPcs,
      nMapping: this.nMapping
    })
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
      if (this.abinPcs[(i + this.iPivot) % n] === 1) {
        let j;
        for (let k = 0; k < n; k++) {
          j = (k + i + 1) % n
          // @ts-ignore
          if (this.abinPcs[(j + this.iPivot) % n] === 1) {
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
   * interval vector (generalized on n)
   *
   * @see https://en.wikipedia.org/wiki/Common_tone_(scale)#Deep_scale_property
   * @see https://en.wikipedia.org/wiki/Interval_vector
   *
   * i=0 => minor seconds/major sevenths (1 or 11 semitones)
   * i=1 => major seconds/minor sevenths (2 or 10 semitones)
   * i=2 => minor thirds/major sixths (3 or 9 semitones)
   * i=3 => major thirds/minor sixths (4 or 8 semitones)
   * i=4 => perfect fourths/perfect fifths (5 or 7 semitones)
   * i=5 => tritones (6 semitones) (The tritone is inversionally equivalent to itself.)
   *
   * Interval class 0, representing unisons and octaves, is omitted.
   *
   * @returns {int[]}
   *
   * Example : iv("0,3,iv(7") => [0,0,1,1,1,0]
   */
  iv(): number[] {
    let n = this.abinPcs.length;
    let res = new Array(n / 2 + n % 2);
    let max = n / 2;
    let v = 0;
    for (let i = 0; i < max; i++) {
      res[i] = 0;
      v++;
      for (let j = 0; j < n; j++) {
        if (this.abinPcs[j] === 1 && this.abinPcs[(j + v) % n] === 1)
          res[i] = res[i] + 1;
      }
    }
    // div last value by 2 (n==12) tritone inversionally equivalent to itself
    // TODO verify if ok when n % 2 != 0
    res[res.length - 1] /= 2;

    return res;
  }

  /**
   * get number of pitches of this
   * @return Number
   */
  get cardinal() {
    return this.abinPcs.filter(i => i === 1).length
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
   * TODO implementation via CYCLIC group action ?!?
   * @return {number}
   */
  cardOrbitMode(): number {
    if (this._cardModesOrbits) {
      return this._cardModesOrbits //
    }

    // this.cardinal === 0 => this.iPivot === undefined
    if (this.cardinal === 0 || this.iPivot === undefined) {
      return this._cardModesOrbits = 0
    }

    // because groupAction Cyclic with n=12 is predefined
    // and cardinal orbit always divise n
    // return this.cardinal / (this.n / this.cyclicPrimeForm().orbit.cardinal)
    // (lazy compute)
    return this._cardModesOrbits = (this.cardinal * this.cyclicPrimeForm().orbit.cardinal) / this.n

    // // old algorithm
    // let modesOrbits = []
    // modesOrbits.push(this)
    // let pcs = this.abinPcs.slice()
    // let n = pcs.length
    // for (let i = (this.iPivot + 1) % n; i < pcs.length + this.iPivot; i++) {
    //   if (pcs[i % n] === 0) continue
    //   let ipcs2 = this.transpose(-i + this.iPivot)
    //   // compareTo pcs without iPivot
    //   if (ipcs2.equalsPcs(this)) {
    //     break
    //   } else {
    //     modesOrbits.push(ipcs2)
    //   }
    // }
    // return this._cardModesOrbits = modesOrbits.length
    //
  }

  /**
   * get number of distinct PCS in cyclic orbit of PCS.
   *
   * @return {number}
   */
  cardOrbitCyclic(): number {
    if (!this.orbit.empty && this.orbit.groupAction == GroupAction.predefinedGroupsActions(this.n, Group.CYCLIC))
      return this.orbit.cardinal

    let ipcsInCyclicGroup: IPcs = GroupAction.predefinedGroupsActions(this.n, Group.CYCLIC).getIPcsInOrbit(this)
    return ipcsInCyclicGroup.orbit.cardinal
  }

  /**
   * get complement of this.
   * Important : complement loses iPivot
   * @return {IPcs} a new instance (free, not attached to an orbit). If not empty orbit,
   * get instance (already exit) of complement held by this group action (this.orbit.getIPcs(complement))
   *
   */
  complement(): IPcs {
    let pcs_cpt = this.abinPcs.map(pc => (pc === 1 ? 0 : 1)) //;slice() and inverse 0/1
    let new_iPivot = undefined
    let actual_iPivot = this.iPivot ?? 0
    let n = pcs_cpt.length
    // iPivot is lost by complement... set a new iPivot of complement
    // opposite is a good candidate when n is even
    if (/*actualiPivot === undefined &&*/ pcs_cpt[0] === 1) {
      new_iPivot = 0
    } else if ((n % 2) === 0 && pcs_cpt[(actual_iPivot + n / 2) % n] === 1) {
      new_iPivot = (actual_iPivot + n / 2) % n
    } else {
      // TODO best strategy to find new iPivot
      // here the first in right circular research
      for (let i = actual_iPivot + 1; i < actual_iPivot + n; i++) {
        if (pcs_cpt[i % n] === 1) {
          new_iPivot = i % n
          break
        }
      }
    }
    let newIpcsComplement = new IPcs({
      binPcs: pcs_cpt,
      iPivot: new_iPivot,
      orbit:this.orbit,
      mappingBinPcs: this.mappingBinPcs,
      nMapping: this.nMapping
    })
    if (this.orbit.groupAction) {
      return this.orbit.groupAction.getIPcsInOrbit(newIpcsComplement)
    } else {
      return newIpcsComplement
    }
  }

  toString() {
    return JSON.stringify(this.abinPcs) + ", iPivot : "
      + JSON.stringify(this.iPivot)
    //	return JSON.stringify(this);
  }

  equals(other: any) {
    return this.equalsPcs(other)
  }

  equalsPcs(other: any) {
    if (other instanceof IPcs) {
      return this.abinPcs.every((v, i) => v === other.abinPcs[i])
    }
    return false
  }

  /**
   *
   * @param ipcs1
   * @param ipcs2
   * @return {number} as waiting by Array sort
   */
  static compare(ipcs1: IPcs, ipcs2: IPcs): number {
    return ipcs1.id - ipcs2.id
  }

  /**
   *
   * @param {IPcs} ipcs2 to compareTo
   * @return {number} as waiting by Array sort
   */
  compareTo(ipcs2: IPcs): number {
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
  axeSymmetry(ipitch: number, arrResearchA: number[], arrResearchB: number[]): number {
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
      if (this.abinPcs[right] === 1)
        arrResearchA[iAxe] = 1; // { in one way }
      if (this.abinPcs[left] === 1)
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
   * @return {
   *       symMedian: number[],
   *       symInter: number[]
   *     }
   */
  getAxialSymmetries() {
    let symMedian: number[] = Array(this.n)
    let symInter: number[] = Array(this.n)
    symMedian.fill(0)
    symInter.fill(0);

    const MEDIAN = 1;
    const INTERCAL = 10;
    const MEDIAN_INTERCAL = 11;

    let nEven = this.n % 2 === 0;
    let imax = nEven ? Math.round(this.n / 2) : this.n;

    let tempA: number[] = Array(this.n);
    let tempB: number[] = Array(this.n);
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

  /** Add or remove index pitch class (ipc)
   *  if iPivot is remove, attempt to determine one
   *
   * @param {number} ipc
   * @return {IPcs} a new instance (free, not attached to an orbit)
   */
  toggleIndexPC(ipc: number): IPcs {
    if (ipc < 0 || ipc >= this.abinPcs.length)
      throw new Error("Invalid index pitch class !")

    let newIPcs: IPcs
    let newBinPcs = this.abinPcs.slice()
    let iPivot = this.iPivot

    if (this.abinPcs[ipc] === 0) {
      newBinPcs[ipc] = 1
      // same pivot
      newIPcs = new IPcs({
        binPcs: newBinPcs,
        n: newBinPcs.length,
        iPivot: this.iPivot,
        orbit:this.orbit,
        mappingBinPcs: this.mappingBinPcs,
        nMapping: this.nMapping
      })
    } else {
      // remove bit 1 to 0
      newBinPcs[ipc] = 0
      let cardinal = this.cardinal
      if (cardinal == 1) {
        newIPcs = new IPcs({
          binPcs: newBinPcs,
          n: newBinPcs.length,
          iPivot: undefined,
          orbit:this.orbit,
          mappingBinPcs: this.mappingBinPcs,
          nMapping: this.nMapping
        })
      } else {
        if (iPivot == ipc) {
          // change iPivot, get the first "to the right"
          let i = ipc, cpt = 0
          while (cpt < this.n) {
            if (newBinPcs[i] == 1) break
            cpt++
            i = (i + 1) % this.n
          }
          let newIPivot = i
          newIPcs = new IPcs({
            binPcs: newBinPcs,
            n: newBinPcs.length,
            iPivot: newIPivot,
            orbit:this.orbit,
            mappingBinPcs: this.mappingBinPcs,
            nMapping: this.nMapping
          })
        } else {
          // same pivot
          newIPcs = new IPcs({
            binPcs: newBinPcs,
            n: newBinPcs.length,
            iPivot: this.iPivot,
            orbit:this.orbit,
            mappingBinPcs: this.mappingBinPcs,
            nMapping: this.nMapping
          })
        }
      }
    }
    return newIPcs
  }

  /**
   * set auto mapping from current binPcs exemple : this = "0,4,7,10", n=12
   * mapping will be in n binPcs intra will be "0,1,2,3", with n = 4 mapping in
   * n=12 into "0,4,7,10"
   */
  autoMap(): IPcs {
    let newBinPcs = new Array(this.cardinal).fill(1);
    let mappingBinPcs = new Array<number>(this.cardinal);

    for (let i = 0, j = 0; i < this.abinPcs.length; i++) {
      if (this.abinPcs[i] == 1)
        mappingBinPcs[j++] = i;
    }

    return new IPcs(
      {
        binPcs: newBinPcs,
        n: this.cardinal,
        mappingBinPcs: mappingBinPcs,
        nMapping: this.abinPcs.length
      })
  }

  /**
   * If this is mapped (this.nMapping > this.n) then
   * create new instance with n <- this.nMapping, and nMapping <- 0
   */
  unMap(): IPcs {
    if (this.nMapping <= this.n) {
      return this // or clone ?
    }

    return new IPcs(
      {
        binPcs: this.getReprBinPcs(),
        n: this.nMapping
      })
  }

  /**
   * Get representative binary pitches class set.
   * In this project, un PCS is always a projection of a pcs of dim inf or equal
   * Example : binPcs = [0,1,1], mappingBinPitches= [0, 4, 7],
   * nMapping = 12 return [0,0,0,0,1,0,0,1,0,0,0,0]
   *
   * @return : number[]
   */
  getReprBinPcs(): number[] {
    // this._mappedBinPcs is constructed into constructor
    return (this._mappedBinPcs.length > 0)
      ? this._mappedBinPcs
      : this.abinPcs;
  }

}
