import {IPcs} from "../core/IPcs";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

export class EightyEight {

  static ORDERED_OPERATIONS_NAMES = ["M1", "M5", "M7", "M11", "CM1", "CM5", "CM7", "CM11"]


  /**
   * Get index of musaic from idMusaic
   * Example : M10-3-3-8-96 => 10
   * @param idMusaic
   */
  static indexOfMusaic =
    (idMusaic: string) => parseInt(idMusaic.split('-')[0].substring(1)) // skip 'M'

  /**
   * Get id of musaic, which is based on:
   * - M prefix
   * - the index of this orbit into group88.orbits
   * - cardinal of orbit.min
   * - #number of distinct isc (motifs)
   * (- number of pcs into orbit - deducing from number of isc)
   *
   * Example: M10-3-3-8-96 => musaic 10, card 3/9, 3rd among same card musaics, 8 isc and 96 pcs into orbit
   *
   * @param pcs
   */
  static idMusaicOf(pcs : IPcs) : string {
    if (pcs.n !== 12) {
      pcs = new IPcs({strPcs:pcs.getMappedPcsStr()})
    }
    const group88 = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    let currentMusaicCard = 1
    let currentMusaicCardIndex = 1

    for (let i = 0; i < group88.orbits.length; i++) {
      const orbit = group88.orbits[i]
      if (orbit.getPcsMin().cardinal !== currentMusaicCard) {
        currentMusaicCard = orbit.getPcsMin().cardinal
        currentMusaicCardIndex = 1
      } else {
        currentMusaicCardIndex++
      }
      if (orbit.has(pcs)) {
        const countDistinctMotifs = 8 / orbit.metaStabilizer.metaStabOperations.length
        // return `M${i+1}-${currentMusaicCard}-${currentMusaicCardIndex}-${countDistinctMotifs}-${orbit.cardinal}`
        return `M${i+1}-${currentMusaicCard}-${countDistinctMotifs}-${orbit.cardinal}`
      }
    }
    throw new Error('Invalid PCS ! (' + pcs.toString() + ')')
  }

  /**
   * Get representative PCS (prime form) of a musaic group orbit from a given pcs
   * @param pcs
   * @return {IPcs} instance
   */
  static getMusaic(pcs : IPcs): IPcs {
    const idxMusaic = this.indexOfMusaic(EightyEight.idMusaicOf(pcs))
    const group88 = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    return group88.orbits[idxMusaic -1].getPcsMin()
  }

  /**
   * Get a list of PCS in musaic group prime form, having same MetaStabilizer than pcs parameter
   * @param pcs
   */
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
