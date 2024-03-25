import {Injectable} from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerPcsService {

  constructor() { }

  transformeByMxT0(pcs: IPcs, a:number): IPcs {
    // if not isDetached() get newPcs resulting of group action
    // It is a question of performance. If newPcs is always in memory, it is no
    // point in keeping two equal instances in memory ?
    // let newPcs = pcs.affineOp(a, 0)
    // if (pcs.orbit?.groupAction) {
    //   newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    // }
    // in "primitive" core operation, orbit is ref shared
    return pcs.affineOp(a, 0)
  }

  translateByM1Tx(pcs: IPcs, t:number): IPcs {
    return pcs.translation(t)
  }

  complement(pcs: IPcs): IPcs {
    return pcs.complement()
  }

  modulation(pcs: IPcs, direction : number): IPcs {
    return pcs.modulation(direction)
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
    return pcs.toggleIndexPC(pcs.indexMappedToIndexInner(index))
  }

}
