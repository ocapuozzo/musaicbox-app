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
 *  instance is "not detached", i.e his orbit is not empty (and linked to an instance of GroupAction)
 *  and has a stabilizer, else, by simple instanciation, an instance of IPcs is called "detached" (by default).
 *
 *  <pre>
 *    Example :
 *    IPcs cm7 = new IPcs({strPcs:'0, 3, 7, 10'});
 *    cm7 =  new IPcs({strPcs:'{0, 3, 7, 10}'});
 *    cm7 = new IPcs({strPcs:'[0, 7, 3, 10]', n:12}); // default n=12
 *
 *    cm7.getPcsStr() => '[0,3,7,10]'
 *    cm7.abinPcs => [1,0,0,1,0,0,0,1,0,0,1,0]
 *    cm7.getMappedBinPcs() => [1,0,0,1,0,0,0,1,0,0,1,0] // by default, automap on himself
 *
 *    const pcsDiatMajMapped = new IPcs({
 *      strPcs: "[0, 2, 4]", // first 3-chord (C E G)
 *      n: 7,
 *      nMapping: 12,
 *      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7]
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
import {ManagerPcsService} from "../service/manager-pcs.service";

const NEXT_MODULATION = 1
const PREV_MODULATION = 2

const negativeToPositiveModulo = (i: number, n: number): number => {
  return (n - ((i * -1) % n)) % n
}

const helperGetGroupActionFrom = (groupName: string): GroupAction | undefined => {
  return ManagerGroupActionService.getGroupActionFromGroupName(groupName)
}

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
   * inner binary representation of pcs (this.abinPcs.length == this.n)
   */
  readonly abinPcs: number[];

  /**
   * id, abinPcs based
   */
  readonly id: number;

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
   * this.templateMappingBinPcs.length == this.n
   * Example : this.n = 7
   *      strPcs: "[0, 2, 4]", // first 3-chord (C E G)
   *      nMapping: 12,
   *      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // pcs [0, 2, 4] mapped into [0,4,7]
   */
  readonly templateMappingBinPcs: number[]

  /**
   * this is abinPcs mapped
   * Be careful : _mappedBinPcs.length == n, not nMapping
   * but element values of _mappedBinPcs are in [0..nMapping[
   * @private
   */
  private readonly _mappedBinPcs: number[] = []


  /**
   * orbit of this (this.orbit.empty by default)
   * orbit is setting by a group action (@link GroupAction)
   */
  orbit: Orbit;

  /**
   * stabilizer of this (getter/setter)
   * is set by a group action @link GroupAction
   * (also - and same - into this.orbit)
   */
    //_stabilizer: Stabilizer

  stabilizerCardinal: number = 0

  //
  // set stabilizer(stab) {
  //   this._stabilizer = stab
  // }
  //
  // get stabilizer(): Stabilizer {
  //   if (this.isDetached()) {
  //     throw new Error('A detached PCS has no Stabilizer !')
  //   }
  //   // already defined by GroupAction constructor, so no need to search in this.orbit
  //   // for (let i = 0; i < this.orbit.stabilizers.length; i++) {
  //   //   let stab: Stabilizer = this.orbit.stabilizers[i]
  //   //   if (stab.fixedPcs.some(pcs => pcs.id == this.id)) {
  //   //     return stab
  //   //   }
  //   // }
  //   // TODO make computed because pivot can change without changing id...
  //   return this._stabilizer
  //   // attached PCS MUST have a Stabilizer !
  // }

  constructor(
    {pidVal, strPcs, binPcs, n, iPivot, orbit, templateMappingBinPcs, nMapping}:
    {
      pidVal?: number,
      strPcs?: string,
      binPcs?: number[],
      n?: number,
      iPivot?: number,
      orbit?: Orbit,
      templateMappingBinPcs?: number[],
      nMapping?: number
    } = {}) {
    if (pidVal !== undefined && pidVal >= 0) {
      this.abinPcs = IPcs.intToBinArray(pidVal, n ?? 12)
      // first index to 1 is iPivot
      this.iPivot = this.abinPcs.findIndex((pc => pc === 1))
    } else if (strPcs !== undefined) {
      this.abinPcs = this._fromStringTobinArray(strPcs, n)
      if (iPivot === undefined) {
        this.iPivot = IPcs.defaultPivotFromStrBin(strPcs)
        // set param iPivot
        iPivot = this.iPivot
      }
    } else if (Array.isArray(binPcs)) {
      // assume pcs bin vector [1,0,1, ... ]
      this.abinPcs = binPcs.slice()
    } else {
      throw new Error("Can't create IPcs instance (bad args = " + strPcs + ")")
    }
    // detached set as valid pcs
    if (this.cardinal === 0) {
      this.iPivot = undefined
    } else if (iPivot === undefined  && iPivot !== 0) {
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

    // default mapping on himself
    if (!templateMappingBinPcs || templateMappingBinPcs.length != this.n) {
      this.templateMappingBinPcs = Mapping.getAutoMapping(this.abinPcs)
    } else {
      this.templateMappingBinPcs = templateMappingBinPcs
    }

    this.nMapping = nMapping ? nMapping : this.n
    // Not this.nMapping = nMapping ?? this.n !!! in case or zero is value of nMapping param

    if (this.nMapping < this.n) throw new Error("Invalid data mapping")

    // check mapping data
    if (this.templateMappingBinPcs.some(value => value >= this.nMapping)) {
      throw new Error("Invalid data mapping")
    }

    // @see method getMappedBinPcs()
    // construct mappedBinPcs (default mapping on himself)
    this._mappedBinPcs = new Array<number>(this.nMapping).fill(0)
    for (let i = 0; i < this.templateMappingBinPcs.length; i++) {
      this._mappedBinPcs[this.templateMappingBinPcs[i]] = this.abinPcs[i];
    }

    // this.serviceManagerGroupAction = inject(ManagerGroupActionService);
  }

  //
  // checkStrpcs(strpcs: string) {
  //   if (strpcs.length > 0) {
  //     if ((strpcs[0] === '[' && strpcs[strpcs.length - 1] === ']') ||
  //       (strpcs[0] === '{' && strpcs[strpcs.length - 1] === '}')) {
  //       strpcs = strpcs.substring(1, strpcs.length - 1);
  //     }
  //     if (strpcs) {
  //       let pitches = strpcs.split(',');
  //       for (let i = 0; i < pitches.length; i++) {
  //         const x = Number(pitches[i])
  //         if (Number.isNaN(x) || x < 0 || x > 12) {
  //           throw new Error("Invalid PCS ! (" + strpcs + ')')
  //         }
  //       }
  //     }
  //   }
  // }


  /**
   * bin array image of PCS string
   * Example : "0, 1, 7" => [1,1,0,0,0,0,0,1,0,0,0,0] (default n = 12)
   * Example : "0, 1, 3", 5 => [1,1,0,1,0] (n = 5)
   *
   * @param {string} strpcs
   * @param {number} n vector dimension
   * @returns {int[]} vector (length == n)
   */
  _fromStringTobinArray(strpcs: string, n: number = 12): Array<number> {

    // assume length = 12
    // this.chekStrpcs(strpcs.trim())

    let bin = new Array(n).fill(0);

    strpcs = strpcs.trim()
    //  if "[1,3,5]" => "1,3,5"
    //  if "{1,3,5}" => "1,3,5"
    if (strpcs.length > 0) {
      // accept "bordered" pcs  "[0,4,7]" or "[0 4 7]" or "{0 4,  7}" "|0, 4 7" etc.
      if (isNaN(Number(strpcs[0]))) {
        // is framed by symbols, remove them
        strpcs = strpcs.substring(1, isNaN(Number(strpcs[strpcs.length - 1])) ? strpcs.length - 1 : undefined);
        strpcs = strpcs.trim()
      }
    }
    if (strpcs) {
      // pre-process string : "0369" => "0 3 6 9", "1110" => "11 10", "10110" => "10 11 0", ...
      strpcs = PcsUtils.pcsStringToStringPreFormated(strpcs)
      // accept "047", "0,4,7" or "0 4 7" or "0 4, 7"... "0AB" ...
      let pitches = strpcs.split(/[ ,]+/);
      for (let i = 0; i < pitches.length; i++) {
        if (!pitches[i] || isNaN(Number(pitches[i])) || Number(pitches[i]) < 0 || Number(pitches[i]) > 12) {
          continue
        }
        bin[Number(pitches[i])] = 1;
      }
    }
    return bin
  }

  /**
   * first pc is pivot by default
   * Case if strpcs is not in  normal form
   * Example : [11, 4, 5] => 11 is iPivot
   * @param strpcs a str Pcs
   */
  static defaultPivotFromStrBin(strpcs: string): number | undefined {
    strpcs = strpcs.trim()
    if (strpcs.length > 0) {
      if (isNaN(Number(strpcs[0]))) {
        // Suppose it is framed by a symbol, delete it
        strpcs = strpcs.substring(1, strpcs.length - 1);
      }
    }
    if (strpcs) {
      let pitches = strpcs.split(/[ ,]+/);
      for (let i = 0; i < pitches.length; i++) {
        if (isNaN(Number(pitches[i]))) continue;
        return Number(pitches[i])
      }
    }
    return undefined;
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
  static intToBinArray(intpcs: number, dim: number): number[] {
    let pitchesArray: number[] = []
    pitchesArray.length = dim;
    pitchesArray.fill(0);
    for (let i = 0; i < dim && intpcs > 0; i++, intpcs = Math.floor(intpcs / 2)) {
      pitchesArray[i] = intpcs % 2;
    }
    return pitchesArray;
  }

  static get NEXT_DEGREE() {
    return NEXT_MODULATION
  }

  static get PREV_DEGREE() {
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
  static id(abin: number[]): number {
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
    let pcsSymmetry : IPcs = cyclicPF

    // if (0 2 4 5 7 9 11)
    if ( pcsSym.k !== undefined) {
      // ok symmetry exist
      const delta = Math.floor(pcsSym.k / 2) // pcsSym.pcs.iPivot ?? 0

      // transpose
      // console.log(`when pivot > 0, k = ${pcsSym.k} pcs = ${pcsSym.pcs.getPcsStr()}`)
      pcsSymmetry = pcsSym.pcs.transposition(-delta)
    }
    if ( !this.isDetached()) {
      pcsSymmetry = ManagerPcsService.makeNewInstanceOf(pcsSymmetry, this.orbit.groupAction!, pcsSymmetry.iPivot)
    } else {
      pcsSymmetry = pcsSymmetry.cloneDetached()
    }
    return  pcsSymmetry
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
    // lazy compute
    const groupName = `n=${this.n} [M1]`
    this._minCyclic = this.getMinFromGroupName(groupName);
    return this._minCyclic
  }

  dihedralPrimeForm() {
    // const groupName = `n=${this.n} [M1 M11]`
    const groupName = `n=${this.n} [M1 M${this.n - 1}]`
    return this.getMinFromGroupName(groupName);
  }

  affinePrimeForm() {
    // const groupName = `n=${this.n} [M1 M5 M7 M11]`
    const operations = IPcs.getStrAffineOpsOf(this.n)
    const groupName = `n=${this.n} ${operations}`
    return this.getMinFromGroupName(groupName);
  }

  musaicPrimeForm(): IPcs {
    // const groupName = `n=${this.n} [M1 M5 M7 M11 CM1 CM5 CM7 CM11]`
    const musaicOps: string = IPcs.getStrMusaicOpsOf(this.n)
    const groupName = `n=${this.n} ${musaicOps}`
    return this.getMinFromGroupName(groupName);
  }

  /**
   * If groupName is same of this pcs, get min of this orbit,
   * else get it from groupAction (cached)
   * @param groupName
   * @private
   */
  private getMinFromGroupName(groupName: string) {
    if (this.orbit.groupAction && this.orbit.groupAction.group.name === groupName) {
      return this.orbit.getPcsMin()
    } else {
      return helperGetGroupActionFrom(groupName)!.getOrbitOf(this)!.getPcsMin()
    }
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
  permute(a: number, t: number):
    IPcs {
    if (this.cardinal === 0) {
      // detached pcs no change
      return this
    }
    // @ts-ignore
    let newPivot = negativeToPositiveModulo((this.iPivot + t), this.abinPcs.length)
    return new IPcs({
      binPcs: IPcs.getBinPcsPermute(a, t, newPivot, this.abinPcs),
      iPivot: newPivot,
      orbit: new Orbit(), // detached pcs
      templateMappingBinPcs: this.templateMappingBinPcs,
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
   * Transposition of this, in n
   * @param t step
   * @returns {IPcs}
   */
  transposition(t: number): IPcs {
    return this.affineOp(1, t)
  }

  /**
   * Modulation of this (change iPivot)
   * @param direction which next or previus degree of modulation
   *  Example : { 0, 4, 7 } iPivot=0,  next=> iPivot == 4,  prev=> iPivot == 7
   * @returns {IPcs} a new object, but same pcs (just pivot change)
   *
   */
  modulation(direction: number): IPcs {
    let newPivot = this.iPivot
    let pivot: number = this.iPivot ?? 0
    if (direction === IPcs.NEXT_DEGREE) {
      let n = this.abinPcs.length
      for (let i = pivot + 1; i < n + pivot; i++) {
        if (this.abinPcs[i % n] === 1) {
          newPivot = i % n
          break
        }
      }
    } else if (direction === IPcs.PREV_DEGREE) {
      let n = this.abinPcs.length
      let i = pivot - 1
      if (i < 0) {
        i = negativeToPositiveModulo(i, n)
      }
      for (; i !== pivot;) {
        if (this.abinPcs[i] === 1) {
          newPivot = i
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
      iPivot: newPivot,
      orbit: this.orbit, // same orbit because same pcs
      templateMappingBinPcs: this.templateMappingBinPcs,
      nMapping: this.nMapping
    })
  }

  static vector2pcsStr(previousValue: number[], currentValue : number, currentIndex:number) {
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
    const pcs = this.abinPcs.reduce(IPcs.vector2pcsStr, [])

    if (withBracket) {
      return `[${pcs.join(' ')}]`
    }
    return pcs.join(' ')
  }


  /**
   * Get textuel representation of this in nMapping (notation bracket)
   * string image of PCS from bin array
   * Example : [1,1,0,0,0,0,0,1,0,0,0,0] => "[0 1 7]"
   * @returns {string}
   */
  getMappedPcsStr(withBracket: boolean = true): string {
    const pcs = this.getMappedBinPcs().reduce(IPcs.vector2pcsStr, [])
    if (withBracket) {
      return `[${pcs.join(' ')}]`
    }
    return pcs.join(' ')
  }


  /**
   * Get Forte Num of this or empty string
   */
  forteNum(): string {
    if (this.n !== 12) return ""

    let forteNum = Forte.forteNum( this );

    if (forteNum) {
      return forteNum;
    }
    // not found ? get with dihedralPrimeForm
    return Forte.forteNum( this.dihedralPrimeForm() );
  }


  /**
   * Change iPivot by default pivot ("leftmost")
   *
   *
   * @return new instance, but same orbit because same pcs is returned (just pivot change)
   */
  cloneWithDefaultPivot(): IPcs {
    const defaultPivot = this.getMappedBinPcs().findIndex(value => value === 1)
    return this.cloneWithNewPivot(defaultPivot)
  }


  /**
   * Change iPivot
   *
   * @param iPivot
   *
   * @return new instance, but same orbit because same pcs is returned (just pivot change)
   */
  cloneWithNewPivot(iPivot ?: number): IPcs {
    // exception is catch when bad iPivot (in constructor logic)
    let newBinPcs = this.abinPcs.slice() // if readonly, it is no necessary
    return new IPcs({
      binPcs: newBinPcs,
      n: newBinPcs.length,
      iPivot: iPivot, // if undefined set default pivot
      orbit: this.orbit, // same orbit because same pcs, just pivot change
      templateMappingBinPcs: this.templateMappingBinPcs,
      nMapping: this.nMapping
    })
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
   * This function work on MappedBinPcs, because this is interface of inner abinPcs
   */
  is(): number[] {
    const res: number[] = []
    const binPcsMapped = this.getMappedBinPcs()
    const nMapped = this.nMapping
    const pivotMapped = this.templateMappingBinPcs[this.iPivot ?? 0]

    for (let i = 0; i < nMapped; i++) {
      if (binPcsMapped[(i + pivotMapped) % nMapped] === 1) {
        let j;
        for (let k = 0; k < nMapped; k++) {
          j = (k + i + 1) % nMapped
          if (binPcsMapped[(j + pivotMapped) % nMapped] === 1) {
            // offset iPivot is not necessary (TODO : say why)
            res.push((nMapped + j - i) % nMapped)
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
    const nMapped = this.nMapping// getMappedBinPcs().length;
    const binPcsMapped = this.getMappedBinPcs()

    let res = new Array(Math.ceil(nMapped / 2));
    // Rem : So res.length is always even, even if n is odd

    let max = nMapped / 2;
    let v = 0;
    for (let i = 0; i < max; i++) {
      res[i] = 0;
      v++;
      for (let j = 0; j < nMapped; j++) {
        if (binPcsMapped[j] === 1 && binPcsMapped[(j + v) % nMapped] === 1)
          res[i] = res[i] + 1;
      }
    }
    // div last value by 2 (n==12) tritone inversionally equivalent to itself
    // TODO verify if correct when n is odd, with examples
    res[res.length - 1] /= 2;

    return res;
  }

  /**
   * get number of pitches of this
   * @return number
   */
  get cardinal(): number {
    return this.abinPcs.filter(i => i === 1).length
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
   * get number of distinct PCS in cyclic orbit of PCS.
   *
   * @return {number}
   */
  cardOrbitCyclic(): number {
    if (this.orbit?.groupAction === ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!)
      return this.orbit.cardinal

    let ipcsInCyclicGroup: IPcs =
      ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!.getIPcsInOrbit(this)

    // @ts-ignore we are sure that orbit is defined in this context (primeForme)
    return ipcsInCyclicGroup.orbit.cardinal
  }

  /**
   * get complement of this.
   * Important : complement loses iPivot
   * @return {IPcs} a new instance (free, not attached to an orbit).
   *
   */
  complement(): IPcs {
    let binCplt: number[] = this.abinPcs.map(pc => (pc === 1 ? 0 : 1)) //;slice() and inverse 0/1
    let new_iPivot = undefined
    let actual_iPivot = this.iPivot ?? 0
    let n = binCplt.length
    // iPivot is lost by complement... set a new iPivot of complement
    // opposite is a good candidate when n is even
    if (/*actualiPivot === undefined &&*/ binCplt[0] === 1) {
      new_iPivot = 0
    } else if ((n % 2) === 0 && binCplt[(actual_iPivot + n / 2) % n] === 1) {
      // on symmetry axe
      new_iPivot = (actual_iPivot + n / 2) % n
    } else {
      // TODO best strategy to find new iPivot
      // here the first in right circular search
      if (binCplt[0] === 1) {
        new_iPivot = 0
      } else {
        for (let i = actual_iPivot + 1; i < actual_iPivot + n; i++) {
          if (binCplt[i % n] === 1) {
            new_iPivot = i % n
            break
          }
        }
      }
    }

    // Note :  if this come from a group action (not detached) then newIpcsComplement already exists in
    // an orbit of this.orbit.groupAction, and its orbit is not empty.
    // @see ManagerPcsService.ts complement method
    // Discussion : is a good idea to make the job of ManagerPcsService here ?
    // hum... no, risk of side effect when construct group action ?
    // if not then we do same job with other transformation operations.
    return new IPcs({
      binPcs: binCplt,
      iPivot: new_iPivot,
      orbit: new Orbit(), // as new pcs, here we don't know its orbit (see note below)
      templateMappingBinPcs: this.templateMappingBinPcs,
      nMapping: this.nMapping
    })

  }

  toString() {
    return JSON.stringify(this.abinPcs) + " n = " + this.n + ", iPivot : "
      + JSON.stringify(this.iPivot)
      + ((this.n != this.nMapping) ? '  Mapped on ' + this.nMapping : '')
    //	return JSON.stringify(this);
  }

  equals(other: any) {
    return this.equalsPcs(other)
  }

  equalsPcs(other: any) {if (other instanceof IPcs) {
      return this.id === other.id
      // return this.abinPcs.every((v, i) => v === other.abinPcs[i])
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

  /**
   * Call in ActionGroup constructor
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
      if (this.getMappedBinPcs()[right] === 1)
        arrResearchA[iAxe] = 1; // { in one way }
      if (this.getMappedBinPcs()[left] === 1)
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
        case MEDIAN_INTERCAL: // pcs detached n even
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
      throw new Error("Invalid index pitch class ! (" + ipc + ")")

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
        orbit: new Orbit(), // not same pcs (old orbit = this.orbit),
        templateMappingBinPcs: this.templateMappingBinPcs,
        nMapping: this.nMapping
      })
    } else {
      // remove bit 1 to 0
      newBinPcs[ipc] = 0
      let cardinal = this.cardinal
      if (cardinal == 1) {
        // make empty pcs
        newIPcs = new IPcs({
          binPcs: newBinPcs,
          n: newBinPcs.length,
          iPivot: undefined,
          orbit: new Orbit(), // not same pcs (old orbit = this.orbit)
          templateMappingBinPcs: this.templateMappingBinPcs,
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
            orbit: new Orbit(), // not same pcs (old orbit = this.orbit)
            templateMappingBinPcs: this.templateMappingBinPcs,
            nMapping: this.nMapping
          })
        } else {
          // same pivot
          newIPcs = new IPcs({
            binPcs: newBinPcs,
            n: newBinPcs.length,
            iPivot: this.iPivot,
            orbit: new Orbit(), // not same pcs (old orbit = this.orbit)
            templateMappingBinPcs: this.templateMappingBinPcs,
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
    let templateMappingBinPcs = new Array<number>(this.cardinal);

    for (let i = 0, j = 0; i < this.abinPcs.length; i++) {
      if (this.abinPcs[i] == 1) {
        templateMappingBinPcs[j++] = i;
      }
    } // end of loop : assert j === this.cardinal - 1
    // assert value element of templateMappingBinPcs in [0..this.abinPcs.length[

    let new_nMapping: number = this.abinPcs.length

    return new IPcs(
      {
        binPcs: newBinPcs,
        n: this.cardinal,
        templateMappingBinPcs: templateMappingBinPcs,
        nMapping: new_nMapping
      })
  }

  /**
   * If this is mapped (this.nMapping > this.n) then
   * create new instance with n === this.nMapping
   */
  unMap(): IPcs {
    if (this.n === 12) {
      return this
    }

    const pivot = this.getPivot() === undefined
      ? undefined
      : this.getMappedPivot()

    return new IPcs({binPcs: this.getMappedBinPcs(), iPivot: pivot})
  }

  /**
   * Get representative binary pitches class set.
   * In this project, un PCS is always a projection of a pcs of dim inf or equal
   * Example : binPcs = [0,1,1], mappingBinPitches = [0, 4, 7],
   * nMapping = 12 return [0,0,0,0,1,0,0,1,0,0,0,0]
   *
   * @return : number[]
   */
  getMappedBinPcs(): number[] {
    // this._mappedBinPcs is constructed into constructor
    return (this._mappedBinPcs.length > 0)
      ? this._mappedBinPcs
      : this.abinPcs;
  }


  getMappedPivot() {
    return this.templateMappingBinPcs[this.iPivot ?? 0]
  }


  isDetached(): boolean {
    return this.orbit.isDetached()
  }


  /**
   * Get correspondance index of a mappedIndex
   * Example :
   *    const pcsDiatMajMapped = new IPcs({
   *       strPcs: "[0, 2, 4]", // first 3-chord
   *       n: 7,
   *       nMapping: 12,
   *       templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7] {C E G}
   *    })
   *    pcsDiatMajMapped.indexMappedToIndexInner(2) => 1
   *
   * @param indexMapped
   * @return index for inner binary vector (abinPcs)
   *         or -1 if indexMapped is not mapped
   */
  indexMappedToIndexInner(indexMapped: number): number {
    return this.templateMappingBinPcs.findIndex(value => indexMapped == value) ?? -1
  }

  getChordName(): string {
    return ([3, 4].includes(this.cardinal)) ? ChordNaming.getFirstChordName(this, this.cardinal) : '' // (this.getFirstScaleNameOrDerived().name ?? '') // or empty ??
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

    // const infoRoot = pcsMap12.iPivot ? ` (root = ${Scales2048Name.ROOT_NAMES[pcsMap12.iPivot]}) \n` : ""
    let infoChord = pcsMap12.getChordName()
    let othersChordNames = pcsMap12.getOthersChordNames()
    if (infoChord) infoChord += "<br>"
    if (othersChordNames) othersChordNames = '(' + othersChordNames + ")<br>"

    return infoChord + /*infoRoot + */ othersChordNames + pcsNames
  }

  /**
   * Get some others mode name, if exist
   */
  getOthersChordNames(): string {
    const pcsMap12 = this.unMap()
    let names: string[] = []

    let pcs = pcsMap12.modulation(IPcs.NEXT_DEGREE)
    for (let i = 1; i < this.cardOrbitMode() - 1; i++) {
      const chordName = pcs.getChordName()
      if (chordName && !names.includes(chordName)) {
        names.push(chordName)
      }
      pcs = pcs.modulation(IPcs.NEXT_DEGREE)
    }
    return names.join("\n")
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
    return this.n === 12 && this.musaicPrimeForm().orbit.cardinal < this.n * 8;
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
    if (this.abinPcs[newPivot] == 0) {
      throw new Error(`Invalid Pivot ! ( ${newPivot} not in PCS ${this.getPcsStr()} )`)
    }
    if (this.iPivot !== newPivot) {
      this.iPivot = newPivot
    }
  }

  static OperationsT0_M11_M5_M7_CM11_CM5_CM7 = [
    new MusaicOperation(12, 11, 0, false),
    new MusaicOperation(12, 5, 0, false),
    new MusaicOperation(12, 7, 0, false),
    new MusaicOperation(12, 11, 0, true),
    new MusaicOperation(12, 5, 0, true),
    new MusaicOperation(12, 7, 0, true)
  ]

  /**
   * Try to define iPivot from symmetries of pcs, if possible
   *
   *
   * @return pivot value or -1 if not found (Not sure this case could exist)
   */
  public getPivotFromSymmetryForComplement(): number {
    return this.getPivotFromSymmetryForComplementByBruteForce()
  }

  /**
   *
   * TODO  to fix [1 2 10 11] pivot 11  => *mini stabilizer* = [M1-T0 M11-T2]
   *        actually [1 2 10 11] pivot 1 = [M1-T0 M11-T10]
   *
   * Try to define iPivot from symmetries of pcs, if possible
   * Begin first with M11, M5 then M7, and their complement, in this order,
   * The first closest to zero win (excludes M1-Tx) !
   * Example of winners : M5-T0, CM5-T11 or CM5-T1 (same distance to zero)
   * @return pivot value or -1 if not found (Not sure this case could exist)
   */
  public getPivotFromSymmetryForComplementByBruteForce(): number {
    // create new instance for test
    let pcsForTest = new IPcs({
      binPcs: this.abinPcs,
      iPivot: this.iPivot,
      orbit: this.orbit,
      templateMappingBinPcs: this.templateMappingBinPcs,
      nMapping: this.nMapping
    })

    if (this.n !== 12) throw Error("pcs.n = " + this.n + " invalid (must be 12 digits)")

    // exists stab in T0 other that M1-T0 ?
    // example : musaic n° 53, 35 (see unit test)
    const id = this.id
    for (let t = 0; t < this.n / 6; t++) {
      for (let i = 0; i < IPcs.OperationsT0_M11_M5_M7_CM11_CM5_CM7.length; i++) {
        for (let j = 0; j < pcsForTest.abinPcs.length; j++) {
          if (pcsForTest.abinPcs[j] === 1) {
            pcsForTest.setPivot(j)
            if (t === 0) {
              // no need to translate when t == 0
              if (id === IPcs.OperationsT0_M11_M5_M7_CM11_CM5_CM7[i].actionOn(pcsForTest).id) {
                // good pivot
                return j
              }
            } else {
              // The case T has been exhausted, let's search with values of T greater than zero.
              // let's try with a value of t which gradually moves away from zero
              // Note : this.n-t and t are both same distance from zero.
              if (id === IPcs.OperationsT0_M11_M5_M7_CM11_CM5_CM7[i].actionOn(pcsForTest).transposition(t).id
                ||
                id === IPcs.OperationsT0_M11_M5_M7_CM11_CM5_CM7[i].actionOn(pcsForTest).transposition(this.n - t).id) {
                // Closest value to zero find
                return j
              }
            }
          }
        }
      }
    }
    return -1 // never ??
  }


  // /**
  //  * Try to define iPivot from symmetries of pcs, if possible
  //  * test first M11, M5 then M7, in this order, the first found is winner
  //  * @return pivot value or -1 if not found
  //  */
  //
  // public sav_getPivotFromSymmetry(): number {
  //   // create new instance for test
  //   let pcsForTest = new IPcs({
  //     binPcs: this.abinPcs,
  //     iPivot: this.iPivot,
  //     orbit: this.orbit,
  //     templateMappingBinPcs: this.templateMappingBinPcs,
  //     nMapping: this.nMapping
  //   })
  //
  //   if (this.n !== 12) throw Error("pcs.n = " + this.n + " invalid (must be 12 digits)")
  //
  //   // no symmetry but exists stab in T0 other that M1-T0 ?
  //   // example : musaic n° 53, 35 (see unit test)
  //   const id = this.id
  //   for (let i = 0; i < IPcs.OperationsT0_M11_M5_M7_CM11_CM5_CM7.length; i++) {
  //     for (let j = 0; j < pcsForTest.abinPcs.length; j++) {
  //       if (pcsForTest.abinPcs[j] === 1) {
  //         pcsForTest.setPivot(j)
  //         if (id === IPcs.OperationsT0_M11_M5_M7_CM11_CM5_CM7[i].actionOn(pcsForTest).id) {
  //           // good pivot
  //           return j
  //         }
  //       }
  //     }
  //   }
  //   return -1
  // }

  /**
   * Get intervals type of intervallic structure
   * Example : is:[2,2,1,2,2,2,1] => [1,2]
   */
  getFeatureIS()
    :
    number[] {
    const is = this.is()
    let feature: number[] = [...new Set(is)]
    // for (let i = 0; i < is.length; i++) {
    //   if (!feature.includes(is[i])) feature.push(is[i])
    // }
    return feature.sort()
  }

  /**
   * Get array of pcs having same intervals type of this
   */
  getPcsSameFeatureIS() {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
    let pcsSameFeatureIS: IPcs[] = []
    const featureIS = this.getFeatureIS()
    groupCyclic.orbits.forEach(orbit => {
      if (ArrayUtil.compareTwoSortedArrays(orbit.getPcsMin().getFeatureIS(), featureIS)) {
        pcsSameFeatureIS.push(orbit.getPcsMin())
      }
    })
    return pcsSameFeatureIS;
  }

  isInWellKnowPrimeForm()
    :
    boolean {
    const idsInPrimeForm = [this.cyclicPrimeForm().id, this.dihedralPrimeForm().id, this.affinePrimeForm().id, this.musaicPrimeForm().id]
    return idsInPrimeForm.includes(this.id)
  }

  /**
   * true if this.iPivot is the leftmost possible pivot.
   * Example : pcs [0, 1, 5] => 0, pcs [2, 3 4] => 2
   * Use for Intervallic Structure where pivot don't exist
   */
  isPivotFirstPosition() {
    return this.iPivot === this.getMappedBinPcs().findIndex(value => value === 1);
  }

  /**
   * Get index of pitchOrder
   * Example : {0, 4, 7}  (cardinal = 3)
   *     pitch order of first pitch = 0
   *     pitch order of second pitch = 4
   *     pitch order of third pitch = 7
   *
   * @param pitchOrder : number [1..this.cardinal]
   * @return index of pitchOrder into aBinPcs having bit to 1
   */
  getVectorIndexOfPitchOrder(pitchOrder
                             :
                             number
  ):
    number {
    if (!pitchOrder || pitchOrder > this.cardinal) {
      return -1
      // throw new Error(`Invalid pitch order ${pitchOrder} `)
    }
    let currentOrder = 0
    for (let i = this.getPivot() ?? 0; i < this.abinPcs.length; i = (i + 1) % this.n) {
      if (this.abinPcs[i] === 1) {
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

  private static

  getStrMusaicOpsOf(n
                    :
                    number
  ) {
    const nPrimeWithN = Group.phiEulerElements(n)
    let res = ''
    // affine op
    for (let i = 0; i < nPrimeWithN.length; i++) {
      res += res ? ` M${nPrimeWithN[i]}` : `M${nPrimeWithN[i]}`
    }
    // same with complement
    for (let i = 0; i < nPrimeWithN.length; i++) {
      res += ` CM${nPrimeWithN[i]}`
    }
    return `[${res}]`;
  }

  private static

  getStrAffineOpsOf(n
                    :
                    number
  ) {
    const nPrimeWithN = Group.phiEulerElements(n)
    let res = ''
    // affine op
    for (let i = 0; i < nPrimeWithN.length; i++) {
      res += res ? ` M${nPrimeWithN[i]}` : `M${nPrimeWithN[i]}`
    }
    return `[${res}]`;
  }

  // TODO best logic
  cloneDetached() {
    // set "empty" ( x.orbit = new Orbit() is done by transposition op )
    // transposition of zero step (kind of clone)
    return this.transposition(0);
  }
}
