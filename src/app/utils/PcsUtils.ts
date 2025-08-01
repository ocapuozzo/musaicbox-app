import {MusaicOperation} from "../core/MusaicOperation";
import {IPcs} from "../core/IPcs";
import {ManagerGroupActionService} from "../service/manager-group-action.service";


export class PcsUtils {

  static  OPERATIONS_IN_T0 = [
    MusaicOperation.convertStringOpToMusaicOperation("M1-T0"),
    MusaicOperation.convertStringOpToMusaicOperation("M5-T0"),
    MusaicOperation.convertStringOpToMusaicOperation("M7-T0"),
    MusaicOperation.convertStringOpToMusaicOperation("M11-T0"),
    MusaicOperation.convertStringOpToMusaicOperation("CM1-T0"),
    MusaicOperation.convertStringOpToMusaicOperation("CM5-T0"),
    MusaicOperation.convertStringOpToMusaicOperation("CM7-T0"),
    MusaicOperation.convertStringOpToMusaicOperation("CM11-T0")
  ]

  /**
   * Solves the equation ak' + k ≡ 0 (mod n) for k', where:
   * - `a` is an integer coprime with `n` (gcd(a, n) = 1),
   * - `k` is an integer in the range [0, n-1],
   * - `n` is an integer greater than 2.
   *
   * @param a - An integer in the range [1, n-1] that is coprime with `n`.
   * @param k - An integer in the range [0, n-1].
   * @param n - A positive integer greater than 2.
   * @returns The value of k' in the range [0, n-1] that solves the equation.
   * @throws Will throw an error if `a` is not coprime with `n`.
   */
  static solveEquationV1(a: number, k: number, n: number): number {
    /**
     * Computes the greatest common divisor (gcd) of two integers `a` and `b`
     * using the extended Euclidean algorithm. Returns the gcd along with
     * coefficients `x` and `y` such that:
     *     gcd(a, b) = a * x + b * y
     *
     * @param a - The first integer.
     * @param b - The second integer.
     * @returns An object containing:
     *          - `gcd`: The greatest common divisor of `a` and `b`.
     *          - `x`: The coefficient for `a` in the linear combination.
     *          - `y`: The coefficient for `b` in the linear combination.
     */
    function extendedGCD(a: number, b: number): { gcd: number, x: number, y: number } {
      if (b === 0) {
        return {gcd: a, x: 1, y: 0}; // Base case: gcd(a, 0) = a
      }
      const {gcd, x: x1, y: y1} = extendedGCD(b, a % b);

      return {gcd, x: y1, y: x1 - Math.floor(a / b) * y1};
    }

    // Step 1: Compute the modular inverse of `a` modulo `n`
    const {gcd, x: aInverse} = extendedGCD(a, n);
    if (gcd !== 1) {
      throw new Error(`'a' must be coprime with 'n'. gcd(${a}, ${n}) = ${gcd}`);
    }

    // Ensure the inverse is positive
    const modInverse = (aInverse % n + n) % n;

    // Step 2: Solve for k' using the formula k' ≡ -k * a⁻¹ (mod n)
    return (-k * modInverse % n + n) % n; // Ensure the result is in [0, n-1]

  }


  /**
   * Solves the equation ak' + k ≡ 0 (mod n) for k', where:
   * - `a` is an integer coprime with `n` (gcd(a, n) = 1),
   * - `k` is an integer in the range [0, n-1],
   * - `n` is an integer greater than 2.

   *  if n = 12 assume that a is prime with it (no throws error)
   *
   * @param a - An integer in the range [1, n-1] that is coprime with `n`.
   * @param k - An integer in the range [0, n-1].
   * @param n - A positive integer greater than 2.
   * @returns The value of k' in the range [0, n-1] that solves the equation.
   * @throws Will throw an error if `a` is not coprime with `n`.
   */
  static solveEquation(a: number, k: number, n: number): number {
    if (n === 12) {
      return this.solveEquationV2(a, k, n)
    }
    return this.solveEquationV1(a, k, n)
  }

  // curiosity discovered in January 2025...
  static solveEquationV2(a: number, k: number, n: number): number {
    // works only if n in [2, 3, 4, 6, 8, 12]
    return n * Math.ceil(k * a / n) - (k * a)
  }

  /**
   * return inverse of this argument  (c,a,t) |-> (c,a,−t⋅a^(−1))
   * @param musOp - A musaic operation
   */
  static getInverse(musOp: MusaicOperation): MusaicOperation {
    return new MusaicOperation(musOp.n, musOp.a, this.solveEquation(musOp.a, musOp.k, musOp.n), musOp.complement)
  }

  // sort operations Mx < Mx+1 < CMx < CMx+1 (without -Tx)
  static compareOpCMaWithoutTk(o1: string, o2: string) {
    let complement1 = o1.charAt(0) === 'C';
    let complement2 = o2.charAt(0) === 'C';
    let w1;
    let w2;
    if (complement1)
      w1 = 100 + parseInt(o1.substring(2));
    else
      w1 = parseInt(o1.substring(1));

    if (complement2)
      w2 = 100 + parseInt(o2.substring(2));
    else
      w2 = parseInt(o2.substring(1));

    return w1 - w2;
  }

  static compareOpCMaTkReducedOrNot(o1: string, o2: string) {
    const complement1 = o1.charAt(0) === 'C';
    const complement2 = o2.charAt(0) === 'C';
    let w1;
    let w2;
    const indexCareto1 = o1.indexOf("-")
    const indexCareto2 = o2.indexOf("-")
    if (complement1)
      w1 = 100 + parseInt(o1.substring(2, indexCareto1));
    else
      w1 = parseInt(o1.substring(1, indexCareto1));

    if (complement2)
      w2 = 100 + parseInt(o2.substring(2, indexCareto2));
    else
      w2 = parseInt(o2.substring(1, indexCareto2));

    if (w1 !== w2) {
      return w1 - w2;
    }
    const indexTildeo1 = o1.indexOf("~")
    const indexTildeo2 = o2.indexOf("~")
    // -Tk
    const k1 = (indexTildeo1 === -1) ? parseInt(o1.substring(indexCareto1 + 2)) : parseInt(o1.substring(indexCareto1 + 2, indexTildeo1))
    const k2 = (indexTildeo2 === -1) ? parseInt(o2.substring(indexCareto2 + 2)) : parseInt(o2.substring(indexCareto2 + 2, indexTildeo2))

    return k1 - k2
  }

  /**
   * Filter pitch classes and has separator between pitch classes and convert A B in 10 11
   * pre-process string :
   * - "0369" => "0 3 6 9"
   * - "1110" => "11 10"
   * - "10110" => "10 11 0"
   * - "101" => "10 1"
   * - "0 4 7" => "0 4 7"
   * - "101" & ',' => "10,1"
   * - 12d - 6610B11", ',' => "1,2,6,10,11"
   * ...
   * Main difficulty if for 2 digits pitch class... (10 or 11)
   *
   * @param strPcs
   * @param config  {separator ?: string, duplicationValues ?: boolean }
   * @return string with values are "numeric string", without duplicate values
   */
  static pcsStringToStringPreFormated(strPcs: string, config: {
    separator?: string,
    duplicationValues?: boolean
  } = {}) {
    // delete spaces and commas
    strPcs = strPcs.split(/[ ,]+/).join(' '); // preserve values as 10 in "10 07" by example
    let separator = config.separator ?? ' '
    let withDuplicationValues = config.duplicationValues ?? true

    let resultPcs = ''
    let ignoreCar = false
    for (let i = 0; i < strPcs.length; i++) {
      if (strPcs.at(i) === "1") {
        if (ignoreCar) {
          // already 1
          resultPcs = resultPcs ? `${resultPcs}${separator}11` : '11'
          ignoreCar = false
        } else {
          // pass (do not consume "1")
          ignoreCar = true
        }
      } else {
        let car = strPcs.at(i)!
        if ("ABET".includes(strPcs.at(i)!.toUpperCase())) {
          switch (strPcs.at(i)!.toUpperCase()) {
            case "A" :
            case "T" :  // T for Ten
              car = "10"
              break
            default : // B or E, see condition
              car = "11"
          }
        }
        if (ignoreCar) {
          // "1" expected to be consumed
          if (' ' === car || isNaN(Number(car))) {
            // pass
            if (' ' === car) {
              resultPcs = resultPcs ? `${resultPcs}${separator}1` : `1`
              ignoreCar = false
            }
          } else {
            switch (car) {
              case "0":
              case "1":
                resultPcs = resultPcs ? `${resultPcs}${separator}1${car}` : `1${car}`
                break
              default:
                resultPcs = resultPcs ? `${resultPcs}${separator}1${separator}${car}` : `1${separator}${car}`
            }
            ignoreCar = false // we have consumed 1
          }
        } else {
          if (' ' === car || isNaN(Number(car))) {
            // pass
          } else {
            resultPcs = resultPcs ? `${resultPcs}${separator}${car}` : `${car}`
          }
        }
      }
    }

    let res = ignoreCar ? `${resultPcs}${separator}1` : resultPcs

    if (res.length > 0 && !withDuplicationValues) {
      // delete duplicate values
      const tempArr = res.split(separator)
      res = tempArr.filter((item, pos, self) => {
        return self.indexOf(item) === pos  // indexOf return the first index that matches, ignore others elements
      }).join(separator)
    }
    return res
  }


  static getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk(pcs: IPcs) {

    let cardinalMode = pcs.cardOrbitMode()

    // empty pcs ?
    if (cardinalMode === 0) {
      return {k: undefined, pcs: pcs}
    }

    let pcsMinK = new Map<IPcs, number>()

    let pcsMod = pcs
    for (let degree = 0; degree < cardinalMode; degree++) {
      // be careful all pcsMod are same id... just pivot change
      pcsMinK.set(pcsMod, this.minkValueThatStabByMInverseOp_Tk(pcsMod))
      pcsMod = pcsMod.modulation("Next")
    }

    let minK = Math.min(...pcsMinK.values())

    if (minK === -1) {
      // no symmetry, return same
      return {k: undefined, pcs: pcs}
    }

    // let minK = pcs.n
    let allPcsHavingMinimumK = Array.from(pcsMinK.keys()).filter(pcs => pcsMinK.get(pcs) === minK)

    // sort with IPcs.compare do not work, because all pcs in collection are same id,
    // so transpose if necessary (change id).
    // There is here we select pcs minimal (not responsibility of caller)
    const transposedPcs = allPcsHavingMinimumK.map(pcs => pcs.iPivot ? pcs.transposition(-pcs.iPivot) : pcs)

    return {k: minK, pcs: transposedPcs.sort(IPcs.compare)[0]}
  }

  static minkValueThatStabByMInverseOp_Tk(pcs: IPcs) {
    let minK = pcs.n
    for (let i = 0; i < pcs.n; i++) {
      let operation = MusaicOperation.convertStringOpToMusaicOperation(`M${pcs.n - 1}-T${i}`) // M11-Tk
      if (operation.actionOn(pcs).id === pcs.id) {
        if (minK > i) minK = i
      }
    }
    return minK === pcs.n ? -1 : minK;
  }


  /**
   * get pivot that max symmetry -T0 for pcsSymmetry, from ops M5-T0, M7-T0, M11-T0 and complement
   * @param pcs
   */
  static getPivotBestSymmetryInT0(pcs: IPcs) : number | undefined {
    let pivotInBestSymmetry = undefined
    let cardinalMode = pcs.cardOrbitMode()

    // empty pcs ?
    if (cardinalMode === 0) {
      return pivotInBestSymmetry
    }
    const getPivots = (previousValue: number[], currentValue:number, currentIndex:number) =>
    {
     return  (currentValue === 1) ? [...previousValue, currentIndex] : previousValue
    }

    const possiblePivots = pcs.vectorPcs.reduce(getPivots, [])

    let pivotAndTheirStabOperations = new Map<number, MusaicOperation[]>()

    let temPcs = pcs.cloneDetached()
    possiblePivots.forEach(pivot => {
      temPcs.setPivot(pivot) // controlled side effect (tempPcs is local)
      // Get list of stabilizing operations in T0 (include complement operations)
      pivotAndTheirStabOperations.set(pivot, this.getMusaicStabOperationsInT0(temPcs))
    })

    /**
     * sort pivot on their array of stab op (in T0) :
     *  max.length to min.length
     *  then, if same length, from "max Mx" to "min Mx" : M11, M7, M5, M1
     */
    const sortedPivotsOnStabMx = new Map([...pivotAndTheirStabOperations.entries()].sort(
      (a, b) => {
        let res = b[1].length - a[1].length
        if (res === 0) {
          res = b[1].reduce((sumA, op) => sumA+op.a, 0)
                -
                a[1].reduce((sumA, op) => sumA+op.a, 0)
        }
        return res
       })
    );

    // first element of keys = first pivot
    const firstPivotMaxStab = sortedPivotsOnStabMx.keys().next().value

    // when choice, pcs.iPivot is preferred because by default
    // pcs.iPivot is the first PC, then its IntervStruct is not shifted
    // Ex : symmetryPrimeForm of [0 1 5 6] => [2 3 9 10] 2  (and not [2 3 9 10] 10)
    if (pcs.iPivot // not "empty pcs"
      && sortedPivotsOnStabMx.has(pcs.iPivot) // exists as pivot stab ?
      && sortedPivotsOnStabMx.get(pcs.iPivot) === sortedPivotsOnStabMx.get(firstPivotMaxStab)) // same stab in T0
    {
      return pcs.iPivot
    }

    // pivot having max stabilizer operations
    return firstPivotMaxStab
  }

  private static getMusaicStabOperationsInT0(pcs: IPcs) {
    return this.OPERATIONS_IN_T0.filter(op => op.actionOn(pcs).id === pcs.id)
  }

  private static getMusaicStabOperationsOf(pcs: IPcs) {
    const operations = ManagerGroupActionService.getGroupActionFromGroupAliasName('Musaic')?.operations!
    return operations.filter(op => op.actionOn(pcs).id === pcs.id)
  }

  /**
   * Maximal Evenness with "cardinality equals variety"
   * as defined in book "Foundations of Diatonic Theory", Timothy A. Johnson, 2003, Key College Publishing
   *
   * @see source http://m.archive.bridgesmathart.org/2000/bridges2000-193.pdf
   * @see https://en.wikipedia.org/wiki/Maximal_evenness
   *
   * @param pcs
   */
  static isMaximalEven(pcs : IPcs) : boolean {
    const cDistance = this.getCDistanceTable(pcs)
    return  cDistance.length > 0 && cDistance.every(cDistance =>
      cDistance.length === 1 || cDistance.length === 2 && cDistance[0] === cDistance[1] - 1
      // one or two distances with consecutive values ( 4,5 no 4,6 )
    )
  }

/**
* == Experimental ==
  * Second Order Maximal Evenness
  * as defined in book "Foundations of Diatonic Theory", Timothy A. Johnson, 2003, Key College Publishing
  * as understand by me (Olivier Capuozzo)
  * "Diatonic triads and seventh chords possess second-order maximal evenness, being maximally even in regard
  *  to the maximally even diatonic scale—but are not maximally even with regard to the chromatic scale."
*  (in https://en.wikipedia.org/wiki/Maximal_evennes)
    *
* @see https://en.wikipedia.org/wiki/Maximal_evenness
    *
* @remarks Is there other algorithm based on n <> 12, based on idea :
    *   A second order maximal evenness is maximal evenness in its dimension as {C E G} in 7
*   This idea was successfully tested in a unit, and unique :(, test
* @param pcs
*/
static isSecondOrderMaximalEven(pcs : IPcs) : boolean {
  const cDistance = this.getCDistanceTable(pcs)
  // TODO

  return false
}


/**
   * == Experimental ==
   * "Strict" Second Order Maximal Evenness
   * From definition of Maximal Evenness in book
   * "Foundations of Diatonic Theory", Timothy A. Johnson, 2003, Key College Publishing
   * extended to 3 consecutive c-distances
   *
   * @param pcs
   */
  static isStrictSecondOrderMaximalEven(pcs : IPcs) : boolean {
    const cDistance = this.getCDistanceTable(pcs)
    return  cDistance.length > 0  && cDistance.every(cDistance =>
        cDistance.length === 3
        && cDistance[0] === cDistance[1] - 1
        && cDistance[1] === cDistance[2] - 1
      // 3 distances with consecutive values
    )
  }

  /**
   * c-distances of a pcs
   * as defined in book "Foundations of Diatonic Theory", Timothy A. Johnson, 2003, Key College Publishing
   * @example for pcs =  "0 2 5 7 10" (or 0 2 4 7 9) pentatonic major
   *  result is : [ [2,3], [4,5], [7,8] ,[9,10] ] (see unit test)
   * @param pcs
   */
  static getCDistanceTable = (pcs: IPcs) => {
    let pcsCDistance: number[][] = []
    const interStruct = pcs.is()
    for (let i = 0; i < interStruct.length-1; i++) {
      pcsCDistance[i] = []
      let cDistance
      for (let j = 0; j < interStruct.length; j++) {
        cDistance = 0
        for (let k = 0; k < (i+1); k++) {
          cDistance += interStruct[(j+k) % interStruct.length]
        }
        if (!pcsCDistance[i].includes(cDistance)) {
          pcsCDistance[i].push(cDistance)
        }
      }
      pcsCDistance[i].sort((a, b) => a-b)
    }
    return pcsCDistance
  }

  /**
   * Deep scale property as defined in book "Foundations of Diatonic Theory", Timothy A. Johnson, 2003,
   * Key College Publishing, page 41
   * deep scale when interval vector has no duplication values
   * @param pcs
   */
  static deepScale(pcs : IPcs): boolean {
    const intervalVector = pcs.iv()
    return [... new Set(intervalVector)].length === intervalVector.length
  }


  /**
   * Get affine images of a PCS
   * @param pcs
   * @param distinct
   */
  static getAffineMotifsOf(pcs: IPcs, distinct : boolean = false) : IPcs[] {
    let motifRepresentatives : IPcs[] = [pcs]
    const aMultiplicative = [5,7,11]
    aMultiplicative.forEach((a:number) => {
      const newPcs = pcs.affineOp(a,0)
      if ( !distinct || !motifRepresentatives.find(pcs => pcs.id === newPcs.id)) {
        motifRepresentatives.push(newPcs)
      }
    })
    return motifRepresentatives
  }

  /**
   * Get Musaic images of a PCS
   * @param pcs
   * @param distinct
   */
  static getMusaicMotifsOf(pcs: IPcs, distinct : boolean = false) : IPcs[] {
    const motifRepresentatives: IPcs[] =
      [...this.getAffineMotifsOf(pcs, distinct), ...this.getAffineMotifsOf(pcs.complement(), distinct)]

    if (distinct) {
      return motifRepresentatives.reduce((unique: IPcs[], currentPcs) =>
        unique.find(pcs =>
          pcs.cyclicPrimeForm().pid() === currentPcs.cyclicPrimeForm().pid()) ? unique : [...unique, currentPcs], [])
    }

    return motifRepresentatives
  }


  }
