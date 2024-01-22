/*
 * Copyright (c) 2019. Olivier Capuozzo
 *  This file is part of the musaicbox project
 *
 *  (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 *  For the full copyright and license information, please view the README.md file of this project.
 *
 */

import {Utils} from "../utils/Utils";

export class MotifStabilizer {

  name: string
  motifStabOperations: string[]
  _hashCode ?: number

  static manyMotifsStabilizer = new MotifStabilizer("*")
  static MAXLENGTH = 12;

  /**
   *
   * @param {string} name as "M1,M5,CM11" (without -Tx and sorted)
   */
  constructor(name : string) {
    this.name = name;
    this.motifStabOperations = this.name.split(",").map(op=> op.trim());
  }

  toString() {
    return this.name;
  }

  getMiniName() {
    if (this.name.length > MotifStabilizer.MAXLENGTH)
      return this.name.substring(0, MotifStabilizer.MAXLENGTH).trim() + "...";
    return this.name;
  }

  equals(obj: any) {
    if (obj instanceof MotifStabilizer) {
      if (obj === this)
        return true;
      return this.name === obj.name;
    }
    return false;
  }

  hashCode() {
    if (!this._hashCode) {
      this._hashCode = Utils.stringHashCode(this.name)
    }
    return this._hashCode
  }

  /**
   * test on length then :
   * Ma < CMa
   */
  static compare(o1 : MotifStabilizer, o2 : MotifStabilizer) : number {
    let cmp = o1.motifStabOperations.length - o2.motifStabOperations.length;
    if (cmp === 0) {
      for (let i = 0; i < o1.motifStabOperations.length; i++) {
        if (o2.motifStabOperations[i].startsWith("C")) {
          if (!o1.motifStabOperations[i].startsWith("C"))
            return -1;
        } else {
          if (o1.motifStabOperations[i].startsWith("C"))
            return 1;
        }

        let ia1 = o1.motifStabOperations[i].startsWith("C") ? 2 : 1;
        let ia2 = o2.motifStabOperations[i].startsWith("C") ? 2 : 1;
        let a1;
        let a2;
        a1 = parseInt(o1.motifStabOperations[i].substring(ia1));
        if (isNaN(a1)) {
          a1 = 0;
        }

        a2 = parseInt(o2.motifStabOperations[i].substring(ia2));
        if (isNaN(a2)) {
          a2 = 0;
        }
        // should compareTo this only if ia2==ia1 ?
        cmp = a1 - a2;
        if (cmp !== 0)
          return cmp;
      }
      return o1.name.localeCompare(o2.name);
    }
    return cmp;
  }
}
