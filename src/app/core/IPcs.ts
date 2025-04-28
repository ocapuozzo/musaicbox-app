/**
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 *  A Pitch Class (ordered) Set with
 *    - inner binary implementation and operations, vector in n dimension
 *    - interface mapped binary representation and operations, vector in n+m dimension (default m=0)
 *
 *  Instance of IPcs can be created by a group action (@link GroupAction), in this case, such
 *  instance is in orbit, i.e his orbit is not empty (and linked to an instance of GroupAction)
 *  and has a stabilizer, else, by simple instanciation, an instance of IPcs is not in orbit (by default).
 *
 *  <pre>
 *    Example :
 *    IPcs cm7 = new IPcs({strPcs:'0, 3, 7, 10'});
 *    cm7 =  new IPcs({strPcs:'{0, 3, 7, 10}'});
 *    cm7 = new IPcs({strPcs:'[0, 7, 3, 10]', n:12}); // default n=12
 *
 *    cm7.getPcsStr() => '[0,3,7,10]'
 *    cm7.vectorPcs => [1,0,0,1,0,0,0,1,0,0,1,0]
 *    cm7.getMappedVectorPcs() => [1,0,0,1,0,0,0,1,0,0,1,0] // by default, automap on himself
 *
 *    const pcsDiatMajMapped = new IPcs({
 *      strPcs: "[0, 2, 4]", // first 3-chord (C E G)
 *      n: 7,
 *      nMapping: 12,
 *      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7]
 *    })
 *    expect(pcsDiatMajMapped.getMappedPcsStr()).toEqual('[0,4,7]')
 *    expect(pcsDiatMajMapped.is()).toEqual([4,3,5]);
 *  </pre>
 *
 *
 */

import {Forte} from './Forte';
import {Orbit} from "./Orbit";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";
import {Mapping} from "../utils/Mapping";
import {ChordNaming} from "./ChordNaming";
import {Scales2048Name} from "./Scales2048Name";
import {MusaicOperation} from "./MusaicOperation";
import {ArrayUtil} from "../utils/ArrayUtil";
import {ManagerGroupActionService} from "../service/manager-group-action.service";
import {PcsUtils} from "../utils/PcsUtils";

export const negativeToPositiveModulo = (i: number, n: number): number => {
  return (n - ((i * -1) % n)) % n
}

const helperGetGroupActionFrom = (groupName: string): GroupAction | undefined => {
  return ManagerGroupActionService.getGroupActionFromGroupName(groupName)
}

export const DIRECTIONS = ['Next', 'Previous'] as const;
export type TDirection = typeof DIRECTIONS[number];

/**
 * @see at top of this file
 * @author Olivier Capuozzo
 */
export class IPcs {

  // inner representation
  /**
   *  dimension of vector (default = 12)
   */
  readonly n: number;

  /**
   * index reference, invariant for all Multiplication operations (Mx)
   */
  iPivot?: number = undefined;


  /**
   * inner binary representation of pcs (this.vectorPcs.length == this.n)
   */
  readonly vectorPcs: number[];

  /**
   * id, vectorPcs based
   */
  readonly id: number;

  /**
   * number of pitches of this
   */
  readonly cardinal: number

  /**
   * predetermines prime forme cyclic of this
   * @private
   */
  private _minCyclic ?: IPcs;

  /**
   * number of different modes of this
   * @private
   */
  private _cardModesOrbits ?: number

  // interface representation

  /**
   * dimension of binary vector for external representation
   * this.nMapping == this.n+m, m=+0 by default (positive number)
   */
  readonly nMapping: number

  /**
   * mapping of this, for external/interface representation
   * this.templateMapping.length == this.n
   * Example : this.n = 7
   *      strPcs: "[0, 2, 4]", // first 3-chord (C E G)
   *      nMapping: 12,
   *      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // length=7,  pcs [0, 2, 4] mapped into [0,4,7]
   *         element values of templateMapping are in [0..nMapping[
   */
  readonly templateMapping: number[]

  /**
   * this is a vectorPcs mapped
   * Be careful : _mappedVectorPcs.length == nMapping, not n
   *
   * @private
   */
  private readonly _mappedVectorPcs: number[] = []


  /**
   * orbit of this (this.orbit.empty by default)
   * orbit is setting by a group action (@link GroupAction)
   */
  orbit: Orbit;

  constructor(
    {pidVal, strPcs, vectorPcs, n, iPivot, orbit, templateMapping, nMapping}:
    {
      pidVal?: number,
      strPcs?: string,
      vectorPcs?: number[],
      n?: number,
      iPivot?: number,
      orbit?: Orbit,
      templateMapping?: number[],
      nMapping?: number
    } = {}) {
    if (n !== undefined && (n < 3 || n > 13)) {
      throw Error(`Bad n = ${n} expected in [3...13]`)
    }
    // case integer given
    if (pidVal !== undefined && pidVal >= 0) {
      if (pidVal >= Math.pow(2, 13)) {
        throw Error(`Bad pidVal = ${pidVal} expected in [0...2^13]`)
      }
      this.vectorPcs = IPcs.intToBinArray(pidVal, n ?? 12)
      // first index to 1 is iPivot
      const tempPivot = this.vectorPcs.findIndex((pc => pc === 1))
      // case of pcs = empty set
      this.iPivot = tempPivot === -1 ? undefined : tempPivot
    }
    // case vector given
    else if (Array.isArray(vectorPcs)) {
      // assume pcs bin vector [1,0,1, ... ]
      this.vectorPcs = vectorPcs.slice()
      if (!this.vectorPcs.every(pc => pc >= 0 && pc <= 1)) {
        throw Error(`Bad vector given = ${vectorPcs} expected [0|1]*`)
      }
      if (this.vectorPcs.length < 3 || this.vectorPcs.length > 13) {
        throw Error(`Bad vector size = ${this.vectorPcs.length} expected in [3...13]`)
      }
    }
    // case string given
    else if (strPcs !== undefined) {
      let vectorAndPivot = IPcs._fromStringTobinArray(strPcs, n)
      this.iPivot = vectorAndPivot.defaultPivot
      this.vectorPcs = vectorAndPivot.vector
    } else {
      throw new Error("Can't create IPcs instance (bad args = " + strPcs + ")")
    }

    // check n
    if (n && n !== this.vectorPcs.length) {
      throw new Error("Can't create IPcs instance (bad n = " + n + " for pcs " + this.vectorPcs + ")")
    }

    this.n = this.vectorPcs.length // normally, param n synchronized
    this.cardinal = this.vectorPcs.reduce((sumOnes, v_i) => v_i === 1 ? sumOnes + 1 : sumOnes, 0)

    // check when iPivot === 0
    if (this.iPivot === undefined && iPivot === 0 && this.cardinal > 0) {
      // special case, sometime force 0, but must be fixed here
      // first pc to 1, may be zero
      this.iPivot = this.vectorPcs.findIndex(pc => pc === 1)
    }
    // check a logic of param iPivot
    else if (iPivot !== undefined) {
      if (iPivot < 0 || iPivot >= this.vectorPcs.length) {
        throw Error(`Something wrong with iPivot = ${this.iPivot} and ${this.vectorPcs}`)
      }
      if (this.vectorPcs[iPivot] !== 1) {
        throw new Error(`Can't create IPcs instance (bad iPivot = ${iPivot} for pcs ${this.vectorPcs} with this.iPivot = ${this.iPivot})`)
      }
      this.iPivot = iPivot
    }

    // check logic of this.iPivot
    if (this.iPivot !== undefined) {
      if (this.cardinal === 0) {
        throw Error(`Something wrong with iPivot = ${this.iPivot} and ${this.vectorPcs}`)
      }
      if (this.cardinal > 0 && this.vectorPcs[this.iPivot] !== 1) {
        throw new Error(`Can't create IPcs instance (bad iPivot = ${iPivot} for pcs ${this.vectorPcs})`)
      }
    }
    // finally check that this.iPivot === undefined only if cardinal === 0
    if (this.iPivot === undefined && this.cardinal > 0) {
      // first pc to 1, may be zero
      this.iPivot = this.vectorPcs.findIndex(pc => pc === 1)
    }

    this.orbit = orbit ?? new Orbit() // a king of "null orbit"
    this.id = IPcs.id(this.vectorPcs)

    // default mapping on himself
    if (!templateMapping || templateMapping.length !== this.n) {
      this.templateMapping = Mapping.getAutoMapping(this.vectorPcs)
    } else {
      this.templateMapping = templateMapping
    }

    this.nMapping = nMapping ? nMapping : this.n
    // Not this.nMapping = nMapping ?? this.n !!! in case or zero is value of nMapping param

    if (this.nMapping < this.n) throw new Error("Invalid data mapping")

    // check mapping data
    if (this.templateMapping.some(value => value >= this.nMapping)) {
      throw new Error("Invalid data mapping")
    }

    // @see method getMappedVectorPcs()
    // construct mappedVectorPcs (default mapping on himself)
    // Example : this.vectorPcs = [1 0 1 0 1 0 0 0]
    //           this.templateMapping = [0 2 4 5 7 9 11] // Diatonic major
    //           this._mappedVectorPcs = [1 0 0 0 1 0 0 1 0 0 0 0]
    this._mappedVectorPcs = new Array<number>(this.nMapping).fill(0)
    for (let i = 0; i < this.templateMapping.length; i++) {
      this._mappedVectorPcs[this.templateMapping[i]] = this.vectorPcs[i];
    }
  }

  /**
   * bin array image of PCS string
   * Example : "0, 1, 7" => [1,1,0,0,0,0,0,1,0,0,0,0] (default n = 12)
   * Example : "0, 1, 3", 5 => [1,1,0,1,0] (n = 5)
   *
   * @param {string} strPcs
   * @param {number} n vector dimension
   * @returns {int[]} vector (length == n)
   */
  static _fromStringTobinArray(strPcs: string, n: number = 12): { vector: number[], defaultPivot: number | undefined } {

    let defaultPivot: number | undefined = undefined

    let bin = new Array(n).fill(0);

    strPcs = strPcs.trim()
    //  if "[1,3,5]" => "1,3,5"
    //  if "{1,3,5}" => "1,3,5"
    if (strPcs.length > 0) {
      // accept "bordered" pcs  "[0,4,7]" or "[0 4 7]" or "{0 4,  7}" "|0, 4 7" etc.
      if (isNaN(Number(strPcs[0]))) {
        // is framed by symbols, remove them
        strPcs = strPcs.substring(1, isNaN(Number(strPcs[strPcs.length - 1])) ? strPcs.length - 1 : undefined);
        strPcs = strPcs.trim()
      }
    }
    if (strPcs) {
      // pre-process string : "0369" => "0 3 6 9", "1110" => "11 10", "10110" => "10 11 0", ...
      const strPcsBis = PcsUtils.pcsStringToStringPreFormated(strPcs)
      // accept "047", "0,4,7" or "0 4 7" or "0 4, 7"... "0AB" ...
      let pitches = strPcsBis.split(/[ ,]+/);
      for (let i = 0; i < pitches.length; i++) {
        if (!pitches[i] || isNaN(Number(pitches[i])) || Number(pitches[i]) < 0 || Number(pitches[i]) > 12) {
          continue
        }
        if (defaultPivot === undefined) {
          defaultPivot = Number(pitches[i])
        }
        bin[Number(pitches[i]) % n] = 1;
      }
    }
    return {vector: bin, defaultPivot: defaultPivot === undefined ? undefined : defaultPivot % n}
  }


  /**
   * Convert integer in binary vector, binary pitches class set
   *
   * @param intpcs
   *           integer value to convert
   * @param dim
   *           vector length
   *
   * @return {Array} (binary pitches class set)
   */
  static intToBinArray(intpcs: number, dim: number): number[] {
    let pitchClassArray: number[] = []
    pitchClassArray.length = dim;
    pitchClassArray.fill(0);
    for (let i = 0; i < dim && intpcs > 0; i++, intpcs = Math.floor(intpcs / 2)) {
      pitchClassArray[i] = intpcs % 2;
    }
    return pitchClassArray;
  }

  /**
   * int identify of PCS Bin Array representation (vector)
   *  function polynomial (bijective function)
   * @param {array} vector
   * @returns {number}
   */
  static pid(vector: number[]): number {
    let n = vector.length;
    let res = 0;
    let pow = 1;
    let card = 0;
    for (let i = 0; i < n; i++) {
      res += vector[i] * pow;
      pow *= 2;
      if (vector[i] === 1)
        card++;
    }
    return res;
  }

  /**
   * int identify of PCS Bin Array representation (vector)
   *  is function polynomial + 2^12 * cardinal
   *   for order relation (min include weight of cardinal)
   * @param {array} vector
   * @returns {number}
   */
  static id(vector: number[]): number {
    let n = vector.length;
    let res = 0;
    let pow = 1;
    let card = 0;
    for (let i = 0; i < n; i++) {
      res += vector[i] * pow;
      pow *= 2;
      if (vector[i] === 1)
        card++;
    }
    return res + card * (1 << n);  // res + ((int) Math.pow(2, dim)) * card;
  }


  pid() {
    return IPcs.pid(this.vectorPcs);
  }

  /**
   *  Get all pcs in cyclic group, with iPivot translated
   */
  getAllCyclicPcsPivotVersion(): IPcs[] {
    let pcsCyclicList: IPcs[] = [this]
    // no get from orbit cyclic because pivot not always logically set
    for (let i = 1; i < this.n; i++) {
      let nextPcs = this.transposition(i)
      // be careful with limited transposition
      if (!pcsCyclicList.find((pcs) => pcs.id === nextPcs.id)) {
        pcsCyclicList.push(nextPcs)
      }
    }
    return pcsCyclicList
  }


  symmetryPrimeForm(): IPcs {
    let cyclicPF = this.cyclicPrimeForm()
    const pcsSym = PcsUtils.getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk(cyclicPF)
    // console.log(` k = ${pcsSym.k} pcs = ${pcsSym.pcs.getPcsStr()}`)

    // default value, when no symmetry
    let pcsSymmetry: IPcs = cyclicPF

    // if (0 2 4 5 7 9 11)
    if (pcsSym.k !== undefined) {
      // ok axial symmetry exists, to be balanced relative to the vertical axis passing through 0
      // as needed. So, if k <> zero, divide k by 2
      const delta = Math.floor(pcsSym.k / 2)

      // Get new version of pcsSymmetry
      // note : id delta > 0, the elected pcs must be transposed, for set vertical axe
      //        else get simple clone
      pcsSymmetry = pcsSym.pcs.transposition(-delta)

    }

    // Now we have best pcsSymmetryAxial, search for a pivot with the best symmetry in -T0
    // get pivot that max symmetry -T0 for pcsSymmetry, from ops M5-T0, M7-T0, M11-T0 and complement
    const pivotBestSymmetry = PcsUtils.getPivotBestSymmetryInT0(pcsSymmetry) ?? pcsSymmetry.iPivot
    //
    // if (pivotBestSymmetry) {
    //   pcsSymmetry = pcsSymmetry.cloneWithNewPivot(pivotBestSymmetry)
    // }

    // new pcs to be relocated in its initial orbit, with good pivot
    if (this.isComingFromOrbit()) {
      pcsSymmetry = pcsSymmetry.getOrMakeInstanceFromOrbitOfGroupActionOf(this.orbit.groupAction!, pivotBestSymmetry === undefined ?  pcsSymmetry.iPivot : pivotBestSymmetry)
    } else {
      // not attached to a group action
      if (pivotBestSymmetry) {
        pcsSymmetry = pcsSymmetry.cloneDetachedWithPivot(pivotBestSymmetry)
      } else {
        pcsSymmetry = pcsSymmetry.cloneDetached()
      }
    }

    return pcsSymmetry
  }

  /// For understand prime form logic, see ManagerGroupActionService utility class
  /// and their unit test in ManagerGroupActionService .spec

  /**
   * Get cyclic PF
   *
   * @return IPcs
   */
  cyclicPrimeForm(): IPcs {
    if (this.cardinal === 0) {
      return this
    }
    if (this._minCyclic) {
      return this._minCyclic
    }
    // lazy compute (M1 => cyclic group for all n > 2)
    const groupName = `n=${this.n} [M1]`
    this._minCyclic = this.getMinOfMyOrbitFromNamedGroup(groupName);
    return this._minCyclic
  }

  dihedralPrimeForm() {
    // const groupName = `n=${this.n} [M1 M11]`
    const groupName = `n=${this.n} [M1 M${this.n - 1}]`
    return this.getMinOfMyOrbitFromNamedGroup(groupName);
  }

  affinePrimeForm() {
    // const groupName = `n=${this.n} [M1 M5 M7 M11]`
    const operations = IPcs.getStrAffineOpsOf(this.n)
    const groupName = `n=${this.n} ${operations}`
    return this.getMinOfMyOrbitFromNamedGroup(groupName);
  }

  musaicPrimeForm(): IPcs {
    // const groupName = `n=${this.n} [M1 M5 M7 M11 CM1 CM5 CM7 CM11]`
    const musaicOps: string = IPcs.getStrMusaicOpsOf(this.n)
    const groupName = `n=${this.n} ${musaicOps}`
    return this.getMinOfMyOrbitFromNamedGroup(groupName);
  }

  /**
   * If groupName is same of this pcs, get min of this orbit,
   * else get it from groupAction (cached)
   * @param groupName
   * @private
   */
  private getMinOfMyOrbitFromNamedGroup(groupName: string) {
    if (this.orbit.groupAction && this.orbit.groupAction.group.name === groupName) {
      return this.orbit.getPcsMin()
    } else {
      return helperGetGroupActionFrom(groupName)!.getOrbitOf(this)!.getPcsMin()
    }
  }

  /**
   * Transformation affine of this
   * @param a
   * @param t
   * @returns {IPcs}
   */
  affineOp(a: number, t: number): IPcs {
    return MusaicOperation.permute(this, a, t)
  }

  /**
   * Transposition of this, in n
   * @param t step
   * @returns {IPcs}
   */
  transposition(t: number): IPcs {
    return MusaicOperation.permute(this, 1, t)
  }

  /**
   * Modulation of this (change iPivot)
   * @param direction which next or previus degree of modulation
   *  Example : { 0, 4, 7 } iPivot=0,  next=> iPivot == 4,  prev=> iPivot == 7
   *  Example : { 0, 4, 7 } iPivot=4,  next=> iPivot == 7,  prev=> iPivot == 0
   * @returns {IPcs} a new object, but same pcs (just pivot change)
   *
   */
  modulation(direction: TDirection): IPcs {
    if (this.cardinal === 0) return this

    const indexes = this.vectorPcs.reduce(IPcs.vector2integerNamePcs, [])

    // double values and size. Ex [0, 4, 7] => [0, 4, 7, 0, 4, 7]
    // to simplify the algorithm.
    indexes.push(...indexes)
    // indexes = [...indexes, ...indexes] : more memory-intensive

    let newPivot: number
    let pivot: number = this.iPivot! // only undefined when cardinal = 0

    if (direction === "Next") {
      // indexOf start from 0
      newPivot = indexes[indexes.indexOf(pivot) + 1]
    } else { // assume (direction === "Previous") {
      // indexOf start from middle of indexes
      newPivot = indexes[indexes.indexOf(pivot, this.cardinal - 1) - 1]
    }
    return this.cloneWithNewPivot(newPivot)
  }

  /**
   * **** Old abandoned implementation ****
   * Modulation of this (change iPivot)
   * @param direction which next or previus degree of modulation
   *  Example : { 0, 4, 7 } iPivot=0,  next=> iPivot == 4,  prev=> iPivot == 7
   *  Example : { 0, 4, 7 } iPivot=4,  next=> iPivot == 7,  prev=> iPivot == 0
   * @returns {IPcs} a new object, but same pcs (just pivot change)
   *
   *  Old implementation
   */
  // _modulation(direction: TDirection): IPcs {
  //   let newPivot = this.iPivot
  //
  //   if (this.cardinal === 0) return this
  //
  //   let pivot: number = this.iPivot!
  //   if (direction === "Next") {
  //     let n = this.vectorPcs.length
  //     for (let i = pivot + 1; i < n + pivot; i++) {
  //       if (this.vectorPcs[i % n] === 1) {
  //         newPivot = i % n
  //         break
  //       }
  //     }
  //   } else if (direction === "Previous") {
  //     let n = this.vectorPcs.length
  //     let i = pivot - 1
  //     if (i < 0) {
  //       i = negativeToPositiveModulo(i, n)
  //     }
  //     for (; i !== pivot;) {
  //       if (this.vectorPcs[i] === 1) {
  //         newPivot = i
  //         break
  //       }
  //       i--
  //       if (i < 0) {
  //         i = negativeToPositiveModulo(i, n)
  //       }
  //     }
  //   }
  //   return this.cloneWithNewPivot(newPivot)
  // }

  /**
   * In arg to reduce. Input array of 0|1, output array of integer [0..n-1]
   * [1,0,0,0,1,0,0,1,0,0,0,0] => [0,4,7]
   * @param previousValue
   * @param currentValue
   * @param currentIndex
   */
  static vector2integerNamePcs(previousValue: number[], currentValue: number, currentIndex: number) {
    if (currentValue === 1) {
      previousValue.push(currentIndex)
    }
    return previousValue
  }

  /**
   * Get textuel representation of this in n (notation bracket by default)
   * string image of PCS from bin array
   * Example : [1,1,0,0,0,0,0,1,0,0,0,0] => "[0 1 7]"
   * @returns {string}
   */
  getPcsStr(withBracket: boolean = true): string {
    const pcsNameIndexes = this.vectorPcs.reduce(IPcs.vector2integerNamePcs, [])

    if (withBracket) {
      return `[${pcsNameIndexes.join(' ')}]`
    }
    return pcsNameIndexes.join(' ')
  }


  /**
   * Get textual representation of this in nMapping (notation bracket or not)
   * string image of PCS from bin array
   * Example : [1,1,0,0,0,0,0,1,0,0,0,0] => "[0 1 7]"
   * @returns {string}
   */
  getMappedPcsStr(withBracket: boolean = true): string {
    const pcs = this.getMappedVectorPcs().reduce(IPcs.vector2integerNamePcs, [])
    return withBracket ? `[${pcs.join(' ')}]` : pcs.join(' ')
  }

  /**
   * Get Forte Num of this or empty string
   */
  forteNum(): string {
    if (this.n !== 12) return ""

    let forteNum = Forte.forteNum(this);

    if (forteNum) {
      return forteNum;
    }
    // not found ? get with dihedralPrimeForm
    return Forte.forteNum(this.dihedralPrimeForm());
  }

  /**
   * intervallic structure, useful to identify scales and modes from cyclic group
   * @see http://architexte.ircam.fr/textes/Andreatta03e/index.pdf : Structure Intervallique page 4
   * @see https://sites.google.com/view/88musaics/88musaicsexplained
   * @returns {int[]}
   *
   * Example : is("0,3,7") => [3,4,5]  (pivot = 0)
   * Example : is( "1,5,8", iPivot:5) > [3, 5, 4]
   * Example : is( "1,5,8", iPivot:1) > [4, 3, 5]
   *
   * This function work on vectorPcs
   */
  is(): number[] {
    const res: number[] = []
    const vector = this.vectorPcs
    const n = this.n
    const pivot = this.iPivot ?? 0

    for (let i = 0; i < n; i++) {
      if (vector[(i + pivot) % n] === 1) {
        let j;
        for (let k = 0; k < n; k++) {
          j = (k + i + 1) % n
          if (vector[(j + pivot) % n] === 1) {
            // offset iPivot is not necessary (TODO : say why)
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
   * @see https://www.robertkelleyphd.com/home/atnltrms.htm
   *  An array of six integers representing the ic (interval class) content of a chord,
   *  where the first digit indicates the number instances of IC1 in the set, the second,
   *  IC2, third, IC3, fourth, IC4, fifth, IC5, and sixth, IC6.
   *  For example, <001110> is the ic vector for a major triad, showing that it contains zero
   *  IC1 (semitones), zero IC2 (wholetones), one IC3 (minor 3rd), one IC4 (major 3rd),
   *  one IC5 (perfect 4th), and zero IC6 (tritones).
   *  Identity of interval vectors (when two sets have the same IC vector) is the determinant
   *  Forte used for his equivalence relations between pc sets (transposition, inversion, Z-relation).
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
   * Example : iv("0,3,7") => [0,0,1,1,1,0]
   */
  iv(): number[] {
    const n = this.n
    const vector = this.vectorPcs

    let res = new Array(Math.ceil(n / 2));
    // Rem : So res.length is always even, even if n is odd (Math.ceil(7 / 2) => 4)

    let max = n / 2;
    let v = 0;
    for (let i = 0; i < max; i++) {
      res[i] = 0;
      v++;
      for (let j = 0; j < n; j++) {
        if (vector[j] === 1 && vector[(j + v) % n] === 1)
          res[i] = res[i] + 1;
      }
    }
    // div last value by 2 (n==12) tritone inversionally equivalent to itself
    if (n % 2 === 0) {
      res[res.length - 1] /= 2;
    }
    return res;
  }


  /**
   * Get number of all modes.
   * For PCS NOT LT (LT = limited transposition), it's this.cardinal, but this observation
   * hides a more complex formula which is : this.cardinal divided by n/orbitCyclic.cardinal
   *
   * As for PCS NOT LT, n/orbitCyclic.cardinal == 1, so it is this.cardinal
   *
   * Examples :
   * <pre>
   * { 0, 3, 6, 9} => 1 (PCS is LT, orbit cyclic card = 3, so 4 /(12/3) = 1)
   * { 0, 4, 8}    => 1 (PCS is LT, orbit cyclic card = 4, so 3 /(12/4) = 1)
   * { 0, 1, 6, 7} => 2 (PCS is LT, orbit cyclic card = 6, so 4 /(12/6) = 2)
   * { 0, 1, 2, 3} => 4 (PCS NOT is LT => orbit cyclic card = 12, so 4 /(12/12) = 4)
   * </pre>
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

    // because groupAction Cyclic is always set
    // and cardinal orbit always divise n (Lagrange's theorem)
    // return this.cardinal / (this.n / this.cyclicPrimeForm().orbit.cardinal)
    // implementation avoid two divisions
    return this._cardModesOrbits = (this.cardinal * this.cyclicPrimeForm().orbit.cardinal) / this.n
  }

  /**
   * get complement of this.
   * Important : complement loses iPivot
   * @return {IPcs} a new instance, if this come from orbit, then new instance come from orbit of orbit.groupAction
   *
   */
  complement(): IPcs {
    return MusaicOperation.complement(this)
  }

  toString() {
    return `[${this.vectorPcs.join( )}] n = ${this.n}, iPivot = ${this.iPivot}`
      + ((this.n != this.nMapping) ? ` Mapped on ${this.nMapping}` : '')
  }

  equals(other: any) {
    return this.equalsPcsById(other)
  }

  equalsPcsById(other: any) {
    if (other instanceof IPcs) {
      return this.id === other.id
    }
    return false
  }

  equalsPcsByIdAndPivot(other: any) {
    if (other instanceof IPcs) {
      return this.id === other.id && this.iPivot === other.iPivot
    }
    return false
  }


  /**
   * Order relation is id based
   *
   * @param ipcs1
   * @param ipcs2
   * @return {number} as expected by Array sort
   */
  static compare(ipcs1: IPcs, ipcs2: IPcs): number {
    return ipcs1.id - ipcs2.id
  }

  /**
   *
   * @param {IPcs} ipcs2 to compareTo
   * @return {number} as expected by Array sort
   */
  compareTo(ipcs2: IPcs): number {
    return IPcs.compare(this, ipcs2)
  }

  /**
   * Call only by ActionGroup constructor
   *
   * @param newIPcs
   */
  addInOrbit(newIPcs: IPcs) {
    if (!this.orbit) {
      this.orbit = new Orbit()
    }
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
    let nEven = this.nMapping % 2 === 0;
    let symmetryIntercalare = nEven ? 10 : 0
    // param arrResearchA & B passed for performance
    // instanced by caller
    arrResearchA.fill(0)
    arrResearchB.fill(0)
    let right = ipitch; // start research
    let left = ipitch; //
    let middle = Math.round(this.nMapping / 2) + 1
    for (iAxe = 0; iAxe < this.nMapping; iAxe++) {
      if (this.getMappedVectorPcs()[right] === 1)
        arrResearchA[iAxe] = 1; // { in one way }
      if (this.getMappedVectorPcs()[left] === 1)
        arrResearchB[iAxe] = 1; // { other way }
      right = (right + 1) % this.nMapping;
      if (left === 0) left = this.nMapping;
      left--;
    }
    // compare
    for (iAxe = 0; iAxe < middle; iAxe++) {
      if (arrResearchA[iAxe] !== arrResearchB[iAxe])
        symmetryMedian = 0;
      if (nEven && arrResearchB[iAxe] !== arrResearchA[(iAxe + 1) % this.nMapping]) {
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
  getAxialSymmetries(): { symMedian: number[], symInter: number[] } {
    let symMedian: number[] = Array(this.nMapping)
    let symInter: number[] = Array(this.nMapping)
    symMedian.fill(0)
    symInter.fill(0);

    const MEDIAN = 1;
    const INTERCAL = 10;
    const MEDIAN_INTERCAL = 11;

    let nEven = this.nMapping % 2 === 0;
    let imax = nEven ? Math.round(this.nMapping / 2) : this.nMapping;

    let tempA: number[] = Array(this.nMapping);
    let tempB: number[] = Array(this.nMapping);
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
   * TODO refactor : a lot of instantiation of IPcs in its body
   *
   * @param {number} ipc
   * @return {IPcs} a new instance (free, not attached to an orbit)
   */
  toggleIndexPC(ipc: number): IPcs {
    if (ipc < 0 || ipc >= this.vectorPcs.length)
      throw new Error("Invalid index pitch class ! (" + ipc + ")")

    let newIPcs: IPcs
    let newVectorPcs = this.vectorPcs.slice()
    let iPivot = this.iPivot

    if (this.vectorPcs[ipc] === 0) {
      newVectorPcs[ipc] = 1
      // same pivot
      newIPcs = new IPcs({
        vectorPcs: newVectorPcs,
        n: newVectorPcs.length,
        iPivot: this.iPivot,
        orbit: new Orbit(), // not same pcs (old orbit = this.orbit),
        templateMapping: this.templateMapping,
        nMapping: this.nMapping
      })
    } else {
      // remove bit 1 to 0
      newVectorPcs[ipc] = 0
      let cardinal = this.cardinal
      if (cardinal == 1) {
        // make empty pcs
        newIPcs = new IPcs({
          vectorPcs: newVectorPcs,
          n: newVectorPcs.length,
          iPivot: undefined,
          orbit: new Orbit(), // not same pcs (old orbit = this.orbit)
          templateMapping: this.templateMapping,
          nMapping: this.nMapping
        })
      } else {
        if (iPivot == ipc) {
          // change iPivot, get the first "to the right"
          let i = ipc, cpt = 0
          while (cpt < this.n) {
            if (newVectorPcs[i] == 1) break
            cpt++
            i = (i + 1) % this.n
          }
          let newIPivot = i
          newIPcs = new IPcs({
            vectorPcs: newVectorPcs,
            n: newVectorPcs.length,
            iPivot: newIPivot,
            orbit: new Orbit(), // not same pcs (old orbit = this.orbit)
            templateMapping: this.templateMapping,
            nMapping: this.nMapping
          })
        } else {
          // same pivot
          newIPcs = new IPcs({
            vectorPcs: newVectorPcs,
            n: newVectorPcs.length,
            iPivot: this.iPivot,
            orbit: new Orbit(), // not same pcs (old orbit = this.orbit)
            templateMapping: this.templateMapping,
            nMapping: this.nMapping
          })
        }
      }
    }
    return newIPcs
  }

  /**
   * set auto mapping from current vectorPcs which becomes templateMapping.
   * Example :
   *   this = "0 4 7 10", n=12 => autoMap
   *      this becomes "0 1 2 3", with n = 4 and templateMapping : "0 4 7 10", n=12
   */
  autoMap(): IPcs {
    let newVectorPcs = new Array(this.cardinal).fill(1);

    // Pre-sizing array before processing.
    let newvectorMapping = new Array<number>(this.cardinal);

    for (let i = 0, j = 0; i < this.vectorPcs.length; i++) {
      if (this.vectorPcs[i] == 1) {
        newvectorMapping[j++] = i;
      }
    } // end of loop : assert j === this.cardinal - 1
    // assert value element of templateMapping in [0..this.vectorPcs.length[

    const new_nMapping: number = this.vectorPcs.length
    const pivot = this.getPivot() === undefined
      ? undefined
      : newvectorMapping.indexOf(this.getPivot()!)

    return new IPcs(
      {
        vectorPcs: newVectorPcs,
        n: this.cardinal,
        iPivot: pivot,
        templateMapping: newvectorMapping,
        nMapping: new_nMapping
      })
  }

  /**
   * If this is mapped (this.nMapping > this.n) then
   * create new instance with n === this.nMapping
   */
  unMap(): IPcs {
    if (this.n === this.nMapping) {
      return this
    }

    const pivot = this.getPivot() === undefined
      ? undefined
      : this.getMappedPivot()

    return new IPcs({vectorPcs: this.getMappedVectorPcs(), n:this.nMapping, iPivot: pivot})
  }

  /**
   * Get representative binary pitches class set.
   * In this project, a PCS is always a projection of a pcs of dim inf or equal
   * Example : vectorPcs = [0,1,1], mappingBinPitches = [0, 4, 7],
   * nMapping = 12 return [0,0,0,0,1,0,0,1,0,0,0,0]
   *
   * @return : number[]
   */
  getMappedVectorPcs(): number[] {
    // this._mappedVectorPcs is constructed into constructor
    return (this._mappedVectorPcs.length > 0)
      ? this._mappedVectorPcs
      : this.vectorPcs;
  }

  getMappedPivot() {
    return this.templateMapping[this.iPivot ?? 0]
  }


  isComingFromOrbit(): boolean {
    return this.orbit.isComingFromGroupAction()
  }

  isComingFromTrivialOrbit(): boolean {
    return this.orbit.groupAction === ManagerGroupActionService.getGroupActionFromGroupAliasName("Trivial")
  }


  /**
   * Get correspondence index of a mappedIndex
   * Example :
   *    const pcsDiatMajMapped = new IPcs({
   *       strPcs: "[0, 2, 4]", // first 3-chord
   *       n: 7,
   *       nMapping: 12,
   *       templateMapping: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7] {C E G}
   *    })
   *    pcsDiatMajMapped.indexMappedToIndexInner(2) => 1
   *
   * @param indexMapped
   * @return index for inner binary vector (vectorPcs)
   *         or -1 if indexMapped is not mapped
   */
  indexMappedToIndexInner(indexMapped: number): number {
    return this.templateMapping.findIndex(value => indexMapped == value) ?? -1
  }

  getChordName(): string {
    return ChordNaming.getFirstChordName(this.unMap(), this.cardinal)
  }

  getFirstNameDetail(): string {
    return this.getNamesDetails(true)
  }

  getNamesDetails(onlyOneName: boolean = false):
    string {
    const pcsMap12 = this.unMap()
    const pcsNames =
      onlyOneName
        ? Scales2048Name.getLinksNameDefs(pcsMap12).find(value => value.name)?.name
        : Scales2048Name.getLinksNameDefs(pcsMap12).map(value => value.name).join("<br>")

    return pcsNames ?? ''
  }

  getFirstScaleNameOrDerived() {
    return Scales2048Name.getFirstScaleNameOrDerived(this);
  }

  isLimitedTransposition() {
    // return this.cyclicPrimeForm().orbit.cardinal != this.n;
    // other implementation :
    return this.cardOrbitMode() != this.cardinal;
    // twice have private property in lazy/cache, so have same complexity O(n) (?)
  }

  /**
   * true if orbit cardinal < 96 (i.e motif stabilizer more than M1-T0)
   */
  isLimitedTransformation() {
    // implementation limited for n === 12
    // TODO : generalize this method !!!
    // const group = this.orbit?.groupAction?.group
    // ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic"))
    return /*this.n === 12 && */this.musaicPrimeForm().orbit.cardinal < this.n * 8;
  }

  getPivot(): number | undefined {
    return this.iPivot;
  }

  /**
   * Change state of this instance by update this.iPivot (rem : do not change identity - id)
   * @param newPivot
   * @throws Error is newPivot is not valid
   */
  setPivot(newPivot: number): void {
    if (newPivot < 0 || newPivot >= this.n) {
      throw new Error(`Invalid Pivot ! ( ${newPivot} with n = ${this.n} )`)
    }
    if (this.vectorPcs[newPivot] == 0) {
      throw new Error(`Invalid Pivot ! ( ${newPivot} not in PCS ${this.getPcsStr()} )`)
    }
    if (this.iPivot !== newPivot) {
      this.iPivot = newPivot
    }
  }

  /**
   * Define future axial symmetrical iPivot of complement of pcs, if possible
   *
   * Examples :
   *  - [0 1 2] => 6
   *  - [1 0 2] => 7  (pivot is 1)
   *  - [0 2 3 5 6 8] => 7
   *  - [0,1,2,3,4,5,6,7,8,9,10,11] => undefined
   *  - [] => 0
   * @return symmetrical pivot value
   */
  public getFutureAxialSymmetryPivotForPrepareComplement(): number | undefined {

    let pivot = this.iPivot

    // empty set pcs ? complement is chromatic scale
    if (pivot === undefined) {
      return 0
    }

    // full pcs => complement is empty set, so ipivot is undefined
    if (this.cardinal === this.n) {
      return undefined
    }

    // be careful with odd n (Math.ceil match logically better than Math.floor)
    let newPivot = (pivot + Math.ceil(this.n / 2)) % this.n

    let ok = this.vectorPcs[newPivot] === 0
    // note : if empty pcs, the ok === true, and do not entry into loop

    let delta = 0
    while (!ok) {
      // sure that exist an index i that verify this.vectorPcs[i] === 0, so it is not an infinite loop :)
      delta++
      let newPivotRight = (this.n + newPivot - delta) % this.n
      let newPivotLeft = (newPivot + delta) % this.n
      ok = this.vectorPcs[newPivotRight] === 0
      if (ok) {
        newPivot = newPivotRight
      } else {
        ok = this.vectorPcs[newPivotLeft] === 0
        if (ok) {
          newPivot = newPivotLeft
        }
      }
    }
    return newPivot
  }



  /**
   * Get generic intervals of intervallic structure
   * Example : is:[2,2,1,2,2,2,1] => [1,2]
   * @see https://en.wikipedia.org/wiki/Generic_and_specific_intervals
   */
  getGenericIntervals(): number[] {
    const is = this.is()
    let feature: number[] = [...new Set(is)]
    return feature.sort()
  }

  /**
   * Get array of pcs having same generic intervals of this
   * Ex : [0,2,4,5,7,9,11] => [1,2] two type os interval : Half tone and Whole tone
   */
  getPcsSameGenericIntervals() {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
    let pcsSameFeatureIS: IPcs[] = []
    const featureIS = this.getGenericIntervals()
    groupCyclic.orbits.forEach(orbit => {
      if (ArrayUtil.compareTwoSortedArrays(orbit.getPcsMin().getGenericIntervals(), featureIS)) {
        pcsSameFeatureIS.push(orbit.getPcsMin())
      }
    })
    return pcsSameFeatureIS;
  }

  isInWellKnowPrimeForm(): boolean {
    const idsInPrimeForm = [this.cyclicPrimeForm().id, this.dihedralPrimeForm().id, this.affinePrimeForm().id, this.musaicPrimeForm().id]
    return idsInPrimeForm.includes(this.id)
  }

  /**
   * true if this.iPivot is the leftmost possible pivot.
   * Example : pcs [0, 1, 5] => 0, pcs [2, 3 4] => 2
   * Use for Intervallic Structure where pivot don't exist
   */
  isPivotFirstPosition() {
    return this.iPivot === this.getMappedVectorPcs().findIndex(value => value === 1);
  }

  /**
   * Get index of pitchOrder for abc notation event
   * Example : {0, 4, 7}  (cardinal = 3)
   *     pitch order 1 => pitch = 0
   *     pitch order 2 => pitch = 4
   *     pitch order 3 => pitch = 7
   *
   * @param pitchOrder : number [1..this.cardinal]
   * @return index of pitchOrder into vectorPcs having bit to 1
   */
  getVectorIndexOfPitchOrder(pitchOrder: number): number {
    if (!pitchOrder || pitchOrder > this.cardinal) {
      return -1
      // throw new Error(`Invalid pitch order ${pitchOrder} `)
    }
    let currentOrder = 0
    for (let i = this.getMappedPivot() ?? 0; i < this.getMappedVectorPcs().length; i = (i + 1) % this.nMapping) {
      if (this.getMappedVectorPcs()[i] === 1) {
        currentOrder++
        if (currentOrder === pitchOrder) {
          return i
        }
      }
    }
    // never pass here
    // throw new Error(`Invalid pitch order ${pitchOrder} `)
    return -1
  }

  /**
   * Get affine + complement operation names of the form Mx and CMx, where x is prime with n
   * @param n
   * @private
   */
  private static getStrMusaicOpsOf(n: number) {
    const nPrimeWithN = Group.phiEulerElementsOf(n)
    const opNames = [...nPrimeWithN.map(x => `M${x}`), ...nPrimeWithN.map(x => `CM${x}`)]
    return '[' + opNames.join(' ') + ']'
  }

  /**
   * Get affine operation names of the form Mx, where x is prime with n
   * @param n
   * @private
   */
  private static getStrAffineOpsOf(n: number) {
    const nPrimeWithN = Group.phiEulerElementsOf(n)
    return '[' + nPrimeWithN.map(x => `M${x}`).join(' ') + ']'
  }

  /**
   * If this not coming from orbit, get stabilizer op, neutral op, M1-T0
   * else get stabilizer operations from operations of group where come from its orbit
   */
  getStabilizerOperations() {
    if (this.isComingFromOrbit()) {
      return this.orbit!.groupAction!.operations.filter(op => op.actionOn(this).id === this.id)
    }
    return [MusaicOperation.convertStringOpToMusaicOperation("M1-T0", this.n)]
  }

  getMappedVersion() {
    return new IPcs({vectorPcs: this.getMappedVectorPcs()});
  }

  /**
   * General way to clone a PCS while retaining its identity (id is vectorPcs based, and it does not change)
   * @param param
   */
  cloneWithData(param: { pivot?: number; nMapping?: number; templateMapping?: number[]; orbit?: Orbit }) {
    return new IPcs({
      n: this.n,
      vectorPcs: this.vectorPcs,
      iPivot: param.pivot ?? this.iPivot,
      nMapping: param.nMapping ?? this.nMapping,
      templateMapping: param.templateMapping ?? this.templateMapping,
      orbit: param.orbit ?? this.orbit
    })
  }


  /**
   * Change iPivot by default pivot ("leftmost")
   *
   *
   * @return new instance, but same orbit because same pcs is returned (just pivot change)
   */
  cloneWithDefaultPivot(): IPcs {
    if (this.cardinal === 0) {
      return this // empty pcs has no iPivot value
    }
    const indexDefaultPivot = this.getMappedVectorPcs().findIndex(value => value === 1)
    // never -1, because cardinal > 0
    return this.cloneWithNewPivot(indexDefaultPivot)
  }


  /**
   * Change iPivot
   *
   * @param pivot
   *
   * @return new instance, but same orbit because same pcs is returned (just pivot change)
   */
  cloneWithNewPivot(pivot: number | undefined): IPcs {
    if (pivot === undefined) {
      if (this.cardinal === 0) {
        return this // no possible change
      }
      throw new Error(`${pivot} is not a valid pivot`)
    }

    return this.cloneWithData({pivot: pivot})
  }

  cloneDetached() {
    return this.cloneWithData({orbit: new Orbit()})
  }

  cloneDetachedWithPivot(pivot: number) {
    return this.cloneWithData({pivot: pivot, orbit: new Orbit()})
  }


  /**
   * Get instance of this, from group action
   * if pivot is given and is not the same that current pivot then make a new instance
   * @param groupAction where to find pcs (for cloning or not)
   * @param newPivot (optional)
   */
   getOrMakeInstanceFromOrbitOfGroupActionOf(groupAction: GroupAction, newPivot ?: number) {
    let newPcsInOrbit = groupAction.getIPcsInOrbit(this)

    const theNewPivot = newPivot === undefined ? this.iPivot : newPivot

    if (newPcsInOrbit.iPivot !== theNewPivot) {
      return newPcsInOrbit.cloneWithNewPivot(theNewPivot)
    }
    return newPcsInOrbit // readonly by default, so can be shared
  }


  isMaximalEven() {
    return PcsUtils.isMaximalEven(this);
  }

  isStrictSecondOrderMaximalEven() {
    return PcsUtils.isStrictSecondOrderMaximalEven(this);
  }
}
