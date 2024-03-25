import {Injectable} from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerPcsService {

  constructor() { }

  transformeByMxT0(pcs: IPcs, a:number): IPcs {
    // if not isDetached() get newPcs resulting of group action
    let newPcs = pcs.affineOp(a, 0)
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }

    return newPcs
  }

  translateByM1Tx(pcs: IPcs, t:number): IPcs {
    let pcsTranslated = pcs.translation(t)
    let newPcs = pcsTranslated
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(pcsTranslated)
      // set pivot from pivot obtained by translation
      if (pcsTranslated.iPivot !== undefined) {
        newPcs.setPivot(pcsTranslated.iPivot)
      }
    }

    return newPcs
  }

  complement(pcs: IPcs): IPcs {
    let newPcs = pcs.complement()
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    return newPcs
  }

  /**
   * Change state of pcs, by set a new pivot
   * @param pcs
   * @param direction
   */
  modulation(pcs: IPcs, direction : number): IPcs {
    let newPcs = pcs.modulation(direction)
    // set pivot from pivot obtained by translation
    if (newPcs.iPivot !== undefined) {
      pcs.setPivot(newPcs.iPivot)
    }
    return pcs
  }

  toggleInnerIndexOrSetIPivot(pcs: IPcs, index: number): IPcs {
    // inner index (no mapping index)
    let newPcs: IPcs
    if (pcs.abinPcs[index] === 0) {
      newPcs = pcs.toggleIndexPC(index)
      if (pcs.orbit?.groupAction) {
        newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
      }
    } else {
      if (index < pcs.n && index >= 0) {
        newPcs =
          new IPcs({
            binPcs: pcs.abinPcs,
            iPivot: index,
            n: pcs.n,
            orbit:pcs.orbit,
            templateMappingBinPcs: pcs.templateMappingBinPcs,
            nMapping: pcs.nMapping
          })
      } else {
        throw new Error("Invalid iPivot : " + index)
      }
    }
    return newPcs
  }

  toggleIndexFromMapped(pcs : IPcs, index: number): IPcs {
    let newPcs = pcs.toggleIndexPC(pcs.indexMappedToIndexInner(index))
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    return newPcs
  }

}
