import {Injectable} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";

@Injectable({
  providedIn: 'root'
})
export class ManagerPcsService {

  constructor() { }

  transformeByMxT0(pcs: IPcs, a:number): IPcs {
    return this.doTransformAffine(pcs, a, 0)
  }

  sav_transformeByMxT0(pcs: IPcs, a:number): IPcs {
    // if not isDetached() get newPcs resulting of group action
    let newPcs = pcs.affineOp(a, 0)
    if (pcs.orbit?.groupAction) {
      let newPcsInOrbit = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
      // set pivot from pivot obtained by translation
      // rem: pivot is not signifiant for pcs identity
      if (newPcs.iPivot !== undefined && newPcs.iPivot !== newPcsInOrbit.iPivot) {
        newPcsInOrbit.setPivot(newPcs.iPivot)
      }
      return newPcsInOrbit
    }
    return newPcs
  }

  translateByM1Tx(pcs: IPcs, t:number): IPcs {
    return this.doTransformAffine(pcs, 1, t)
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
   * Change state of pcs, by set a new pivot
   * @param pcs
   * @param direction
   */
  modulation(pcs: IPcs, direction : number): IPcs {
    // return new instance, even if same pcs (<> pivot) for reactive update ui by angular
    // with same orbit
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
        // change pivot only
        newPcs =
          new IPcs({
            binPcs: pcs.abinPcs,
            iPivot: index,  // change pivot
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
    if (pcs.orbit?.groupAction) {
      newPcs = ManagerPcsService.makeNewInstanceOf(newPcs, pcs.orbit?.groupAction, newPcs.getPivot());
    }
    return newPcs
  }

  /**
   * Get new instance àf this argument, with "empty" orbit
   * @param pcs a detached PCS
   */
  doDetach(pcs: IPcs) : IPcs {
    // set "empty" ( x.orbit = new Orbit() is done by translation op )
    // translation of zero step (kind of clone)
    return pcs.translation(0);
  }

  doTransformAffine(pcs : IPcs, a : number, t : number) : IPcs {
    let newPcs = pcs.affineOp(a, t)
    const savPivot = newPcs.getPivot()
    if (pcs.orbit?.groupAction) {
      newPcs = ManagerPcsService.makeNewInstanceOf(newPcs, pcs.orbit.groupAction, savPivot);
    }
    return newPcs
  }

  /**
   * Build instance of IPcs from pcs and group action (king of clone, with pivot may be changed)
   * @param pcs to find image in action group
   * @param groupAction where to find pcs (for cloning)
   * @param newPivot
   * @private
   */
  public static makeNewInstanceOf(pcs: IPcs, groupAction: GroupAction, newPivot: number | undefined) {
    let newPcsInOrbit = groupAction.getIPcsInOrbit(pcs)

    let clonePcs = new IPcs({
      binPcs: newPcsInOrbit.abinPcs,
      iPivot: newPivot,
      orbit: newPcsInOrbit.orbit,

      templateMappingBinPcs: newPcsInOrbit.templateMappingBinPcs,
      nMapping: newPcsInOrbit.nMapping
    })

    clonePcs.stabilizer = newPcsInOrbit.stabilizer
    return clonePcs
  }

}
