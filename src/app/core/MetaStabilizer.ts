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

export class MetaStabilizer {

  name: string
  metaStabOperations: string[] // example: ['M1', 'CM5']
  _hashCode : number

  static nullMetaStabilizer = new MetaStabilizer("")
  static MAXLENGTH = 12;

  /**
   *
   * @param {string} name as "M1,M5,CM11" or "M1 M5 CM11" (sorted and without -Tx)
   */
  constructor(name : string) {
    this.name = name;
    // if (name.includes(","))
    //   this.metaStabOperations = this.name.split(",").map(op=> op.trim());
    // else
    //   this.metaStabOperations = this.name.split(" ").map(op=> op.trim());
    //
    this.metaStabOperations = this.name.split(/[ ,]+/).map(op=> op.trim());

    this._hashCode = StringHash.stringHashCode(this.name)
  }

  toString() {
    return this.name;
  }

  getMiniName() {
    if (this.name.length > MetaStabilizer.MAXLENGTH)
      return this.name.substring(0, MetaStabilizer.MAXLENGTH).trim() + "...";
    return this.name;
  }

  equals(obj: any) {
    if (obj instanceof MetaStabilizer) {
      if (obj === this)
        return true;
      return this.name === obj.name;
    }
    return false;
  }

  hashCode(): number {
    return this._hashCode
  }

  /**
   * test on length then :
   * Ma < CMa
   */
  static compare(o1 : MetaStabilizer, o2 : MetaStabilizer) : number {
    let cmp = o1.metaStabOperations.length - o2.metaStabOperations.length;
    if (cmp === 0) {
      for (let i = 0; i < o1.metaStabOperations.length; i++) {
        if (o2.metaStabOperations[i].startsWith("C")) {
          if (!o1.metaStabOperations[i].startsWith("C"))
            return -1;
        } else {
          if (o1.metaStabOperations[i].startsWith("C"))
            return 1;
        }

        let ia1 = o1.metaStabOperations[i].startsWith("C") ? 2 : 1;
        let ia2 = o2.metaStabOperations[i].startsWith("C") ? 2 : 1;
        let a1;
        let a2;
        a1 = parseInt(o1.metaStabOperations[i].substring(ia1));
        if (isNaN(a1)) {
          a1 = 0;
        }

        a2 = parseInt(o2.metaStabOperations[i].substring(ia2));
        if (isNaN(a2)) {
          a2 = 0;
        }
        // should compareTo this only if ia2===ia1 ?
        cmp = a1 - a2;
        if (cmp !== 0)
          return cmp;
      }
      return o1.name.localeCompare(o2.name);
    }
    return cmp;
  }
}
