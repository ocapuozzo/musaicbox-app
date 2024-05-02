import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";
import {Orbit} from "../core/Orbit";

export class PcsSearch {

  /**
   * Search PCS having same interval vector from cyclic group
   * @param searchIV
   * @return IPcs[]
   */
  static searchPcsWithThisIV(searchIV:string): IPcs[] {
    const pcsWithSameIV: IPcs[] = []
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    for (const orbit of groupCyclic.orbits) {
      const pcsPF = orbit.getPcsMin()
      if (pcsPF.iv().toString() == searchIV) {
        pcsWithSameIV.push(pcsPF)
          // new IPcs({strPcs:pcsPF.getPcsStr(), orbit: new Orbit()}))
      }
    }
    return pcsWithSameIV
  }

  /**
   * Search PCS having intervallic structure from cyclic group
   * Ex : 3,3,3,3 => PCS : { 0, 3, 6, 9 }
   * @param searchIS intervallic structure
   * @return IPcs or undefined
   */
  static searchPcsWithThisIS(searchIS : string) : IPcs  | undefined{
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    return groupCyclic.getPcsWithThisIS(searchIS)
  }

}
