import {IPcs} from "../core/IPcs";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

export class EightyEight {

  static ORDERED_OPERATIONS_NAMES = ["M1", "M5", "M7", "M11", "CM1", "CM5", "CM7", "CM11"]


  // static indexMusaic = (idMusaic: string) => parseInt(idMusaic.split('-')[0].substring(3))
  static indexMusaic = (idMusaic: string) => parseInt(idMusaic.split('-')[0])


  /**
   * Get id of musaic, which is based on
   * - the index of this orbit into group88.orbits
   * - cardinal of orbit.min
   * - index of orbit.min relative to others orbit.mins with same cardinal
   *
   * Example: 1-2-1 => musaic 1, last 1 is the position of musaic/orbit relative to orbits of cardinal 2
   *
   * @param pcs
   */
  static idNumberOf(pcs : IPcs) : string {
    let currentMusaicCard = 1
    let currentMusaicCardIndex = 1
    if (pcs.n !== 12) {
      pcs = new IPcs({strPcs:pcs.getMappedPcsStr()})
    }
    const group88 = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    for (let i = 0; i < group88.orbits.length; i++) {
      const orbit = group88.orbits[i]
      if (orbit.getPcsMin().cardinal !== currentMusaicCard) {
        currentMusaicCard = orbit.getPcsMin().cardinal
        currentMusaicCardIndex = 1
      } else {
        currentMusaicCardIndex++
      }
      if (group88.orbits[i].has(pcs)) {
        return `${i+1}-${currentMusaicCard}-${currentMusaicCardIndex}`
      }
    }
    throw new Error('Invalid PCS ! (' + pcs.toString() + ')')
  }

  /**
   * Get representative PCS (prime forme) of a musaic group orbit, from a pcs
   * @param pcs
   * @return {IPcs} instance
   */
  static getMusaic(pcs : IPcs): IPcs {
    const group88 = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    const idxMusaic = this.indexMusaic(EightyEight.idNumberOf(pcs))
    return group88.orbits[idxMusaic -1].getPcsMin()
  }

  static getPrimeFormMusaicsWithSameMetaStabilizerOf(pcs: IPcs) : IPcs[] {
    const group88 = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    const orbit =  group88.getOrbitOf(pcs)
    let pcsReprOfMusaic : IPcs[] = []
    group88.orbits.forEach((o) =>
    {
      if (o.metaStabilizer.name == orbit.metaStabilizer.name) {
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
