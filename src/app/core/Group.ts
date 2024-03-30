/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {MusaicPcsOperation} from "./MusaicPcsOperation";
import {IPcs} from "./IPcs";

export class Group {

  /** indexes for predefinedGroups12
   *  @see GroupAction.spec
   */
  static CYCLIC = 0
  static DIHEDRAL = 1
  static AFFINE = 2
  static MUSAIC = 3

  static _predefinedGroups12 : Group[]

  operations : MusaicPcsOperation[]

  name: string

  /**
   * initialize instance by generate all operations from operations passed in parameter
   * @param {MusaicPcsOperation[]} someGeneratorMusaicPcsOperations
   */
  constructor(someGeneratorMusaicPcsOperations : MusaicPcsOperation[]) {
    this.operations = Group.buildOperationsGroupByCaylayTable(someGeneratorMusaicPcsOperations)
    this.name = this.buildNameGroup()
  }

  static get predefinedGroups12() : Group[]{
    if (! this._predefinedGroups12) {
      this._predefinedGroups12 = []
      // index == 0 == Group.CYCLIC
      let opM1_T1 = new MusaicPcsOperation(12, 1, 1, false);
      this._predefinedGroups12.push(new  Group([opM1_T1]))

      // index == 1 == Group.DIHEDRAL
      let opM11_T1 = new MusaicPcsOperation(12, 11, 1, false);
      this._predefinedGroups12.push(new  Group([opM1_T1, opM11_T1]))

      // index == 2 == Group.AFFINE
      let opM5_T1 = new MusaicPcsOperation(12, 5, 1, false);
      this._predefinedGroups12.push(new  Group([opM1_T1, opM11_T1, opM5_T1]))

      // index == 3 == Group.MUSAIC
      let opCM1_T0 = new MusaicPcsOperation(12, 1, 0, true);
      this._predefinedGroups12.push(new  Group([opM1_T1, opM11_T1, opM5_T1, opCM1_T0]))
    }
    return this._predefinedGroups12
  }

  /**
   *
   * @param {IPcs} ipcs
   * @return IPcs copy with orbit
   */
  buildOrbitOf(ipcs: IPcs){
     if (ipcs.n !== this.operations[0].n) {
       throw new Error("buildOrbitOf on pcsList which bad n:" + ipcs)
     }
     let pcsCopy = new IPcs({pidVal : ipcs.id})
     this.operations.forEach(op => pcsCopy.addInOrbit(op.actionOn(pcsCopy)))
     return pcsCopy
  }


  /**
   * Generate all operations from a set of operations, implement Cayley
   * table algorithm
   *
   * @param {Array} someGeneratorMusaicPcsOperation
   *           : a "sub group operations" (generators of group)
   * @return {Array} ordered list of operations including someOperations and 0..n more generated
   * operations by table cayley composition.
   */
  static buildOperationsGroupByCaylayTable(someGeneratorMusaicPcsOperation: MusaicPcsOperation[]): MusaicPcsOperation[] {
    let allOps: MusaicPcsOperation[] = [...someGeneratorMusaicPcsOperation]
    let loop = true
    while (loop) {
      let cardinalOp = allOps.length
      loop = false;
      // forLoop:
      for (let i = 0; i < cardinalOp; i++) {
         for (let j = 0; j < cardinalOp; j++) {
           let newop = allOps[i].compose(allOps[j]);
           if (!allOps.find(op => op.getHashCode() === newop.getHashCode())) {
             // ho ! add a line and column to the calay table
             // no more restart from begin index because
             // up vector dimension add redundant by symmetry
             // TODO  must be demonstrated... and verified by tests unit
             allOps.push(newop)
             // loop = true;
             // break forLoop
             cardinalOp++
           } else {
             // console.log("-------------------------------------")
             // console.log("newop = " + newop)
             // console.log("newop.getHashCode() : " + newop.getHashCode())
           }
         }// for j
       }// for i
     } // while loop
    allOps.sort(MusaicPcsOperation.compare)
    return allOps
  }

  /**
   * http://www.idevelopment.info/data/Programming/data_structures/java/gcd/GCD.java
   *
   * @param {number} m
   * @param {number} n
   * @return {number}
   */
  static gcd(m:number, n:number):number {
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
  static phiEulerElements(n:number):number[] {
    let eltsMinGenerator : number[] = []
    eltsMinGenerator.push(1);
    // TODO stop to n/2, and define others by symmetry
    for (let i = 2; i < n; i++) {
      if (this.gcd(i, n) === 1) {
        eltsMinGenerator.push(i);
      }
    }
    return eltsMinGenerator;
  }

  isComplemented(){
    return this.operations.some(op => op.isComplemented() )
  }

  /**
   *  Group.CYCLIC name => n=12 [M1, T1]
   *  Group.MUSAIC name => n=12 [M1, M5, M7, M11, Cplt, T1]
   *
   * @private
   */
  private buildNameGroup() {
    const dico: Map<number, number> = new Map<number, number>()
    for (const op of this.operations) {
      if (dico.has(op.a)) {
        // @ts-ignore
        dico.set(op.a, dico.get(op.a) + op.t)
      } else {
        dico.set(op.a, op.t)
      }
    }
    let opsM= ''
    let opT = 0
    for (const ops_a of dico.keys()) {
      opsM += opsM ? ', M' + ops_a : 'M' + ops_a
      opT += dico.get(ops_a) ?? 0
    }
    opsM += this.isComplemented() ? ', Cplt' : ''
    opsM += opT>1 ? ', T1' : ', T0'

    opsM = '[' + opsM + ']'
    return `n=${this.operations[0].n} ${opsM}`
  }
}
