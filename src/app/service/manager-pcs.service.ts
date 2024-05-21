import {Injectable} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {Orbit} from "../core/Orbit";

@Injectable({
  providedIn: 'root'
})
export class ManagerPcsService {

  constructor() { }

  transformeByMxT0(pcs: IPcs, a:number): IPcs {
    // if not isDetached() get newPcs resulting of group action
    let newPcs = pcs.affineOp(a, 0)
    const savPivot = newPcs.getPivot()
    if (pcs.orbit?.groupAction) {
      let newPcsInOrbit = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
      newPcs = new IPcs({
        binPcs: newPcsInOrbit.abinPcs,
        iPivot: savPivot,
        orbit: newPcsInOrbit.orbit,
        templateMappingBinPcs: newPcsInOrbit.templateMappingBinPcs,
        nMapping: newPcsInOrbit.nMapping
      })
    }
    return newPcs
  }

  sav_transformeByMxT0(pcs: IPcs, a:number): IPcs {
    // if not isDetached() get newPcs resulting of group action
    let newPcs = pcs.affineOp(a, 0)
    if (pcs.orbit?.groupAction) {
      let newPcsInOrbit = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
      // set pivot from pivot obtained by translation
      // rem: pivot is not signifiant for pcsList identity
      if (newPcs.iPivot !== undefined && newPcs.iPivot !== newPcsInOrbit.iPivot) {
        newPcsInOrbit.setPivot(newPcs.iPivot)
      }
      return newPcsInOrbit
    }
    return newPcs
  }

  translateByM1Tx(pcs: IPcs, t:number): IPcs {
    let pcsTranslated = pcs.translation(t)
    // let newPcs = pcsTranslated
    if (pcs.orbit?.groupAction) {
      let newPcsInOrbit = pcs.orbit.groupAction.getIPcsInOrbit(pcsTranslated)
      // set pivot from pivot obtained by translation
      // rem: pivot is not signifiant for pcsList identity
      if (pcsTranslated.iPivot !== undefined && newPcsInOrbit.iPivot !== pcsTranslated.iPivot) {
        newPcsInOrbit.setPivot(pcsTranslated.iPivot)
      }
      return newPcsInOrbit
    }
    return pcsTranslated
  }

  complement(pcs: IPcs): IPcs {
    let newPcs = pcs.complement()
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    // lost iPivot, set a new
    const newPivot = newPcs.getPivotFromSymmetry()
    if (newPivot >= 0) {
      return new IPcs({
        binPcs: newPcs.abinPcs,
        iPivot: newPivot,
        orbit: newPcs.orbit,
        templateMappingBinPcs: newPcs.templateMappingBinPcs,
        nMapping: newPcs.nMapping
      })
    }
     return newPcs
  }

  /**
   * Change state of pcsList, by set a new pivot
   * @param pcs
   * @param direction
   */
  modulation(pcs: IPcs, direction : number): IPcs {
    // return new instance, even if same pcsList (<> pivot) for reactive update ui by angular
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
    let newPcs = pcs.toggleIndexPC(index)
    let savNewPcs = newPcs
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
      // set pivot from pivot obtained by translation
      // rem: pivot is not signifiant for pcsList identity
      if (savNewPcs.iPivot !== undefined && newPcs.iPivot !== savNewPcs.iPivot) {
        newPcs.setPivot(savNewPcs.iPivot)
      }
    }
    return newPcs
  }

  doDetach(pcs: IPcs) : IPcs {
    // translation of zero step (kind of clone)
    let newPcs = pcs.translation(0)
    // set "empty" orbit
    newPcs.orbit = new Orbit()
    return newPcs;
  }
}
