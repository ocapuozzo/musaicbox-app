import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";

export class EightyEight {

  static idNumberOf(pcs : IPcs) : number {
    if (pcs.n !== 12) {
      pcs = new IPcs({strPcs:pcs.getMappedPcsStr()})
    }
    const group88 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    for (let i = 0; i < group88.orbits.length; i++) {
      if (group88.orbits[i].has(pcs)) {
        return i+1
      }
    }
    throw new Error('Invalid PCS ! (' + pcs.toString() + ')')
  }

  /**
   * Get representative PCS (prime forme) of a musaic group orbit, from a pcs
   * @param pcs
   * @return {IPcs} instance
   */
  static getMusaic(pcs : IPcs) {
    const group88 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    return group88.orbits[EightyEight.idNumberOf(pcs) -1].getPcsMin()
  }

}
