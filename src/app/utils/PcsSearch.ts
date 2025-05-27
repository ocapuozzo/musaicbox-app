import {IPcs} from "../core/IPcs";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

export class PcsSearch {

  /**
   * Search PCS having same interval vector from cyclic group
   * @param searchIV
   * @return IPcs[]
   */
  static searchPcsWithThisIV(searchIV:string): IPcs[] {
    const pcsWithSameIV: IPcs[] = []
    const cyclicGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
    for (const orbit of cyclicGroup.orbits) {
      const pcsPF = orbit.getPcsMin()
      if (pcsPF.iv().toString() === searchIV) {
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
    const trivialGroup = ManagerGroupActionService.getGroupActionFromGroupAliasName("Trivial")!
    return trivialGroup.getPcsWithThisIS(searchIS.trim())
  }

  /**
   * Search PCS having pid from cyclic group
   * Ex : 585 => PCS : { 0, 3, 6, 9 }
   * @param pid polynomial integer value
   * @return IPcs or undefined
   */
  static searchPcsWithThisPid(pid: number) {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
    return groupCyclic.getPcsWithThisPid(pid)
  }
}
