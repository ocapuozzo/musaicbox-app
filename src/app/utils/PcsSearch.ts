import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";

export class PcsSearch {

  static searchPcsWithThisIV(searchIV:string): IPcs[] {
    const pcsWithSameIV: IPcs[] = []
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    for (const orbit of groupCyclic.orbits) {
      const pcsPF = orbit.getPcsMin()
      if (pcsPF.iv().toString() == searchIV) {
        pcsWithSameIV.push(pcsPF)
      }
    }
    return pcsWithSameIV
  }


}
