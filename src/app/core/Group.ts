/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {MusaicOperation} from "./MusaicOperation";
import {IPcs} from "./IPcs";

export class Group {

  operations: MusaicOperation[]

  readonly name: string
  readonly opsNamesWithoutTx: string[]

  /**
   * initialize instance by generate all operations from operations passed in parameter
   * @param {MusaicOperation[]} someGeneratorMusaicPcsOperations
   */
  constructor(someGeneratorMusaicPcsOperations: MusaicOperation[]) {
    this.operations = Group.buildOperationsGroupByCayleyTable(someGeneratorMusaicPcsOperations)
    let res = this.buildGroupNameAndOpsNameWithoutTx()
    this.name = res.name
    this.opsNamesWithoutTx = res.opsNamesWithoutTx
  }


  /**
   *
   * @param {IPcs} ipcs
   * @return IPcs copy with orbit
   */
  buildOrbitOf(ipcs: IPcs) {
    if (ipcs.n !== this.operations[0].n) {
      throw new Error("buildOrbitOf on pcs which bad n:" + ipcs)
    }
    let pcsCopy = new IPcs({pidVal: ipcs.pid()})
    this.operations.forEach(op => pcsCopy.addInOrbit(op.actionOn(pcsCopy)))
    return pcsCopy
  }


  /**
   * Generate all operations from a set of operations, implement Cayley
   * table algorithm
   *
   * @param {Array} someGeneratorMusaicPcsOperation a "sub group operations" (generators of group)
   * @return {Array} ordered list of operations including someOperations and 0..n more generated
   * operations by table cayley composition.
   */
  static buildOperationsGroupByCayleyTable(someGeneratorMusaicPcsOperation: MusaicOperation[]): MusaicOperation[] {
    let allOps: MusaicOperation[] = [...someGeneratorMusaicPcsOperation]
    // let loop = true
    // while (loop) {
      let cardinalOp = allOps.length
      // loop = false;
      // forLoop:
      for (let i = 0; i < cardinalOp; i++) {
        for (let j = 0; j < cardinalOp; j++) {
          let newOp = allOps[i].compose(allOps[j]);
          if (!allOps.find(op => op.getHashCode() === newOp.getHashCode())) {
            // ho ! add a line and column to the cayley table
            // no more restart from begin index because
            // up vector dimension add redundant by symmetry
            // TODO  must be demonstrated... and verified by tests unit
            allOps.push(newOp)
            cardinalOp++
            // if newOp.a and n == 7, then will do add here all ops because
            // 2 * 2 = 4 and 4 * 2 = 1 and basta... not generate 3 and more...
            // 2 its prime with primes number, but is bad generator with multiplication, so additive way below
            if (newOp.a === 2) {
              for (let k = newOp.a * 2; k < newOp.n; k += newOp.a) {
                const newOpBis = new MusaicOperation(newOp.n, k, newOp.t)
                if (!allOps.find(op => op.getHashCode() === newOpBis.getHashCode())) {
                  allOps.push(new MusaicOperation(newOp.n, k, newOp.t))
                  cardinalOp++
                }
              }
            }
            // loop = true;
            // break forLoop
          } else {
            // console.log("-------------------------------------")
            // console.log("newOp = " + newOp)
            // console.log("newOp.getHashCode() : " + newOp.getHashCode())
          }
        }// for j
      }// for i
    // } // while loop
    allOps.sort(MusaicOperation.compare)
    return allOps
  }

  /**
   * http://www.idevelopment.info/data/Programming/data_structures/java/gcd/GCD.java
   *
   * @param {number} m
   * @param {number} n
   * @return {number}
   */
  static gcd(m: number, n: number): number {
    if (m < n) {
      let t = m;
      m = n;
      n = t;
    }

    let r = m % n;

    if (r === 0) {
      return n;
    } else {
      return this.gcd(n, r);
    }
  }

  /**
   * Get min elements generators of phiEulerElements of n prime_root(n)
   *
   * @param {number} n  n > 0
   * @return {number[]} minimum elts necessary for generate phiEulerElements of n
   */
  static phiEulerElementsOf(n: number): number[] {
    let eltsMinGenerator: number[] = []
    eltsMinGenerator.push(1);
    // TODO stop to n/2, and define others by symmetry
    for (let i = 2; i < n; i++) {
      if (this.gcd(i, n) === 1) {
        eltsMinGenerator.push(i);
      }
    }
    return eltsMinGenerator;
  }

  isComplemented() {
    return this.operations.some(op => op.isComplemented())
  }

  /**
   *  Examples :
   *  <pre>
   *  Group.CYCLIC name => n=12 [M1]
   *  Group.MUSAIC name => n=12 [M1 M5 M7 M11 CM1 CM5 CM7 CM11]
   * </pre>
   *
   * @private
   */
  private buildGroupNameAndOpsNameWithoutTx() : { opsNamesWithoutTx: string[], name : string } {
    let opsNamesWithoutTx: string[] = []

    if (this.operations.length === 1 && this.operations[0].a === 1 && this.operations[0].t === 0 && !this.operations[0].complement){
      opsNamesWithoutTx.push("M1-T0")
    } else {
      // REM: this.operations is sorted
      for (const op of this.operations) {
        const opNameWithoutT = op.toStringWithoutTransp()
        if (!opsNamesWithoutTx.includes(opNameWithoutT)) {
          opsNamesWithoutTx.push(opNameWithoutT)
        }
      }
    }
    return {
      name: `n=${this.operations[0].n} [${opsNamesWithoutTx.join(" ")}]`,
      opsNamesWithoutTx : opsNamesWithoutTx,
    }
  }
  //
  // getGroupName() : IGroupName {
  //   return {
  //     n:this.operations[0].n,
  //     metaOps : this.opsNamesWithoutTx
  //   }
  // }

}
