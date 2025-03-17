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
import {MetaStabilizer} from "./MetaStabilizer";
import {IPcs} from "./IPcs";
import {MusaicOperation} from "./MusaicOperation";
import {PcsUtils} from "../utils/PcsUtils";

export class Stabilizer {
  fixedPcs: IPcs[];
  operations: MusaicOperation[];
  strMetaStabilizer: string;
  _shortName: string
  _metaStabilizer ?: MetaStabilizer
  _hashCode ?: number
  // sumT: number
  // _fixedPcsInPrimeForm: IPcs[]

  constructor(
    {fixedPcs, operations}:
    { fixedPcs?: IPcs[], operations?: MusaicOperation[] } = {}) {
    this.fixedPcs = fixedPcs ?? []
    this.operations = operations ?? [];
    this.strMetaStabilizer = "";
    this._shortName = ""
    this._hashCode = undefined
    this._metaStabilizer = undefined
    // this.sumT = this.computeSumTNear0();
    // this._fixedPcsInPrimeForm = []
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

  addOperation(op: MusaicOperation) {
    if (!this.operations.find(o => o.getHashCode() === op.getHashCode())) {
      this.operations.push(op);
      // this.sumT = this.computeSumTNear0();
      this.operations.sort(MusaicOperation.compare);
      this.strMetaStabilizer = "";
      this._shortName = "";
      this._hashCode = undefined
      this._metaStabilizer = undefined
      // this._fixedPcsInPrimeForm = []
    }
  }

  addFixedPcs(ipcs: IPcs) {
    if (!this.fixedPcs.find(p => p.id === ipcs.id)) {
      this.fixedPcs.push(ipcs)
      // this._fixedPcsInPrimeForm = []
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

  get metaStabilizer() {
    if (!this._metaStabilizer) {
      this._metaStabilizer = new MetaStabilizer(this.reduceNameByIgnoreTransp().trim())
    }
    return this._metaStabilizer
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
      let metaOp = op.toStringWithoutTransp();
      if (metaOp !== prec) {
        prec = metaOp;
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

    public void setOperations(List<MusaicOperation> operations) {
      this.operations = operations;
      strMetaStabilizer = null;
      _shortName = null;
    }
    */
  get cardinal() {
    return this.operations.length;
  }


  compareTo(otherStab: Stabilizer): number {
    // return this.getName().compare(o.getName());
    return Stabilizer.compare(this, otherStab)
  }

  static compareShortName(stab1: Stabilizer, stab2: Stabilizer) {
    // return StringHash.stringHashCode(stab1.getShortName()) - StringHash.stringHashCode(stab2.getShortName())
    return stab1.getShortName().localeCompare(stab2.getShortName(), 'us') // 'us' for determinist !
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
    if (strMetaStabilizer == null)
      strMetaStabilizer = new MetaStabilizer(reduceByIgnoreTransp());
    return strMetaStabilizer;
  }
  */

  getName() {
    let res = "";
    this.operations.forEach(op => res = res + " " + op.toString());
    return res;
    // return this.getShortName() + "";
  }

  /**
   * Reduce texte representation of stabilizers.
   * Example : CM1-T3 CM1-T9 => CM1-T3~6*  where 6 is step
   */
  getShortName() {
    if (!this._shortName)
      this._shortName = Stabilizer.makeShortNameIfPossible(this.operations);
    return this._shortName;
  }


  /**
   * get if set operations is subset of this
   * @param {MusaicOperation[]} ops array of MusaicOperation
   * @return {boolean} true if ops in this.operations
   */
  isInclude(ops: MusaicOperation[]): boolean {
    let isInclude = true;
    ops.forEach(op => {
      if (!this.operations.find(o => o.equals(op))) {
        isInclude = false;
      }
    });
    return isInclude;
  }

  /**
   * Return true if this is "up to transposition", false else.
   * expected : always true
   */
  get isMotifEquivalence() {
    return this.getName().includes("M1-T1")
  }

  /**
   * get short name of  operations
   * CM1-T0 CM1-T4 CM1-T8 => CM1-T0~4*
   * CM1-T3 CM1-T9 => CM1-T3~6*
   * CM1-T1 CM1-T3 CM1-T5 CM1-T7 CM1-T9 CM1-T11 => CM1-T1~2*
   * M1-T0 M11-T1 => M1-T0 M11-T1
   *
   * @param operations
   */
  static makeShortNameIfPossible(operations : MusaicOperation[]) {
    if (operations.length === 0) return ''

    let reducedStabName : string[] = []

    const n = operations[0].n
    // 1 get all operations
    // key : "Ma" or "CMa" op name (Ex: M5, CM5) nameOpsWithoutT
    // value : x of TX (Ex : 2, 3, 4) transposition value
    let cmt = new Map<string, number[]>()

      // assert in : operations is sorted
      for (let i = 0; i < operations.length; i++) {
        let op = operations[i]
        let nameOpWithoutT = (op.complement ? "CM" : "M") + op.a;
        if (!cmt.has(nameOpWithoutT)) {
          cmt.set(nameOpWithoutT, []);
        }
        if (!cmt.get(nameOpWithoutT)?.includes(op.t)) {
          cmt.get(nameOpWithoutT)!.push(op.t);
          cmt.get(nameOpWithoutT)!.sort((a, b) => a - b)
        }

    }

    // 2: sort operations Mx < Mx+1 < CMx < CMx+1
    let nameOpsWithoutT = Array.from(cmt.keys())
    nameOpsWithoutT.sort(PcsUtils.compareOpCMaWithoutTk)

    // 3: reducer name by extracting the transposition coefficient x, as ~x*
    // CM5-T2 CM5-T6 CM5-T10 => CM5-T2~4*  (4 is transposition coefficient, equivalent 'up to 4-steps transposition')
    // M11-T0 M11-T2 M11-T4 M11-T6 M11-T8 M11-T10 => M11-T0~2*
    for (let i = 0; i < nameOpsWithoutT.length; i++) {
      let nameOpWithoutT = nameOpsWithoutT[i]
      let shortName = ''

      // Pcs [0,2,4,6,8] in orbit. Group : n=12 [M1 M11]  Orbit cardinal : 12
      //  Orbit name (stabilizers signature) : M1-T0 M11-T0~4*
      //
      // code for debug, with condition
      // const orbitSearching = this.ipcsset.find(pcs => pcs.pid() === 67) != undefined
      let prevNumberOfElts = cmt.get(nameOpWithoutT)?.length
      let numberOfElts
      do {
        prevNumberOfElts = cmt.get(nameOpWithoutT)?.length
        // be careful ( pcs : 0,1,3,4,6,7,9,10 ) in M1,M11
        //   M11-T1 M11-T2 M11-T4 M11-T5 M11-T7 M11-T8 M11-T10 M11-T11 => M11-T1~3* and M11-T2~3*
        if (prevNumberOfElts && prevNumberOfElts >= 2) {
          // assert : cmt.get(nameOpWithoutT) is sorted
          // cmt.get(nameOpWithoutT)?.forEach(a => console.log(a + ''))
          const steps = cmt.get(nameOpWithoutT)
          let resultStep = this.getCycleStep(cmt.get(nameOpWithoutT), n)
          if (resultStep.step) {
            shortName = nameOpWithoutT + "-T" + cmt.get(nameOpWithoutT)![0] + "~" + resultStep.step + "*";
            // when shortName is defined, delete entry
            // let firstStep = cmt.get(nameOpWithoutT)![0]
            let steps = cmt.get(nameOpWithoutT)!

            //example exclude all elements where index match resultStep.stepIndex
            // reduce steps 0,1,2,4,5,7,8,10,11 -> 1,4,7,10 (indexStep = 2)
            // reduce steps 0,1,2,4,5,7,8,10,11 -> 1,2,5,7,10,11 (indexStep = 3)
            let remainingSteps =
              steps?.filter((k, index) => (index % resultStep.stepIndex !== 0))

            cmt.set(nameOpWithoutT, remainingSteps)
            reducedStabName.push(shortName)
          } else {
            // second try, but inverse search, and accept all elements do not match
            let stepsReverse = [...cmt.get(nameOpWithoutT)!].reverse()
            resultStep = this.getCycleStep(stepsReverse, n)
            if (resultStep.step) {
              shortName = nameOpWithoutT + "-T" + stepsReverse[0] + "~" + resultStep.step + "*";

              let remainingSteps = []
              for (let j = 0; j < stepsReverse.length; j++) {

                if (j+resultStep.stepIndex < stepsReverse.length
                    && stepsReverse[j] === stepsReverse[j+resultStep.stepIndex] + resultStep.step) {
                  // pass
                  // and also other element (delete from list)
                  stepsReverse.splice(j+resultStep.stepIndex,1)
                } else {
                  remainingSteps.push(stepsReverse[j])
                }
              }

              cmt.set(nameOpWithoutT, remainingSteps.reverse())
              reducedStabName.push(shortName)
            }
          }
        }
        numberOfElts = cmt.get(nameOpWithoutT)?.length
      } while (numberOfElts && prevNumberOfElts !== numberOfElts)

      // 4: put -Tx only if a (some stabilizers that cannot be reduced by preview phase 3)
      let the_as = cmt.get(nameOpWithoutT) ?? []
      for (let j = 0; j < the_as.length; j++) {
        let a = the_as[j]
        reducedStabName.push(nameOpWithoutT + "-T" + a);
      } // loop a
    } // loop for nameOpsWithoutT

    return reducedStabName.sort(PcsUtils.compareOpCMaTkReducedOrNot).join(' ')

  }


  /**
   *
   * search step cycle for reduce, or not :
   *
   *   0,2,10 => step=0, stepIndex=0
   *   2,5,8,11 => step=3, stepIndex=1
   *   1,2,4,5,7,8,10,11 => 3 (4-1, 7-4, 10-7) == 3 (5-2, 8-5, 11-8) ==> step=3 , stepIndex=2
   *   0,4,8 => step=4, stepIndex=1
   *   1,5,7,11 => ??? (7-1) == 6 (11-5) step=== 6 , stepIndex=2
   *   1,3,5,7 => step=6, stepIndex=3 // because :
   *    stepIndex = 1 (3-1, 5-3, 7-5) => step=2
   *     but nb comparaisons+1 => 4, and 2 <> 12/4 NO !
   *    stepIndex = 2 (5-1) => step=4
   *     but nb comparaisons+1 => 2, and 4 <> 12/2 NO !
   *    stepIndex = 3 (7-1) => step=6
   *     nb comparaisons+1 => 2, and 6 = 12/2 YES !
   *
   *  stepIndex return if for caller, for delete sequence values of steps
   *
   * @param steps values of T
   * @param n
   * @return { step: number, stepIndex :number }
   */
  static getCycleStep(steps ?: number[], n = 12): { step: number; stepIndex: number } {
    let stepResult = 0
    const inverse = steps !== undefined && steps.length > 1 && steps[0] > steps[1]
    const diff = (a: number, b: number): number => inverse ? b-a : a-b
    let find = false
    let i = 1
    if (steps)
      for (; i < steps.length && diff(steps[i],steps[0]) <= n/2; i++) {
        // let step = steps[i] - steps[0]
        let step = diff(steps[i],steps[0])
        find = true
        let nComparaisons = 0
        for (let k = i; k < steps.length  && step * (nComparaisons+1) < n; k += i) {
          nComparaisons++
          // if (steps[k] - steps[k-i] !== step) {
          if (diff(steps[k],steps[k-i]) !== step) {
            find = false
            break
          }
        }
        // console.log(`with ${steps} : (${step} === 12/( ${nComparaisons}+1) ??`)
        if (find && (step === n/(nComparaisons+1))) {
          stepResult = step
          // console.log(`with ${steps} : (${step} === 12/( ${nComparaisons}+1) ??`)
          break
        }
      }

    return {step: stepResult, stepIndex : stepResult ? i : 0 }

  }


}
