import { Injectable } from '@angular/core';
import {IPcs} from "../core/IPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerPcsService {

  constructor() { }

  transformeByMxT0(pcs: IPcs, a:number): IPcs {
    let newPcs = pcs.affineOp(a, 0)
    // if not isDetached() get newPcs resulting of group action
    // It is a question of performance. If newPcs is always in memory, it is no
    // point in keeping two equal instances.
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    return newPcs
  }

  translateByM1Tx(pcs: IPcs, t:number): IPcs {
    let newPcs = pcs.translation(t)
    // if not isDetached() get newPcs resulting of group action
    // It is a question of performance. If newPcs is always in memory, it is no
    // point in keeping two equal instances.
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    return newPcs
  }

  complement(pcs: IPcs): IPcs {
    let newPcs = pcs.complement()
    // if not isDetached() get newPcs resulting of group action
    // It is a question of performance. If newPcs is always in memory, it is no
    // point in keeping two equal instances.
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    return newPcs
  }

  modulation(pcs: IPcs, direction : number): IPcs {
    let newPcs = pcs.modulation(direction)
    // if not isDetached() no get newPcs resulting of group action because
    // iPivot is always same and iPivot is not taken into account in pcs's identity
    return newPcs
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
    // It is a question of performance. If newPcs is always in memory, it is no
    // point in keeping two equal instances.
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    return newPcs
  }

}
