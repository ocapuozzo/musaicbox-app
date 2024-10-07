import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";

export class EightyEight {

  static ORDERED_OPERATIONS_NAMES = ["M1", "M5", "M7", "M11", "CM1", "CM5", "CM7", "CM11"]

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
   * Get representative PCS (prime forme) of a musaic group orbit, from a pcsList
   * @param pcs
   * @return {IPcs} instance
   */
  static getMusaic(pcs : IPcs): IPcs {
    const group88 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    return group88.orbits[EightyEight.idNumberOf(pcs) -1].getPcsMin()
  }

  static getMusaicsWithSameMotifStabilizersOf(pcs: IPcs) : IPcs[] {
    const group88 = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    const orbit =  group88.getOrbitOf(pcs)
    let pcsReprOfMusaic : IPcs[] = []
    group88.orbits.forEach((o) =>
    {
      if (o.motifStabilizer.name == orbit.motifStabilizer.name) {
        pcsReprOfMusaic.push(o.getPcsMin())
      }
    })
    return pcsReprOfMusaic;
  }

  /** Sort list of operations names (without -Tx)
   * Example :
   * in  : ["M1", "CM7", "CM5", "M5"]
   * out : ["M1", "M5", "CM5", "CM7"]
   *
   * @param currentSelectedOp array to sort
   * @return new sorted array
   */
  static sortToOrderedOperationsName(currentSelectedOp: string[]) {
    let newCurrentSelectedOpOrdered: string[] = []
    for (let i = 0; i < EightyEight.ORDERED_OPERATIONS_NAMES.length; i++) {
      if (currentSelectedOp.includes(EightyEight.ORDERED_OPERATIONS_NAMES[i])) {
        newCurrentSelectedOpOrdered.push(EightyEight.ORDERED_OPERATIONS_NAMES[i])
      }
    }
    return newCurrentSelectedOpOrdered;
  }


}
