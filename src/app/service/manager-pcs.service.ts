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
      // set pivot from pivot obtained by transposition
      // rem: pivot is not signifiant for pcs identity
      if (newPcs.iPivot !== undefined && newPcs.iPivot !== newPcsInOrbit.iPivot) {
        // change pivot, so as immutable, make a new instance
        // newPcsInOrbit.setPivot(newPcs.iPivot) <== BAD idea, side effect !!
        newPcsInOrbit =  new IPcs({
          binPcs: newPcsInOrbit.abinPcs,
          iPivot: newPcs.iPivot,
          orbit: newPcsInOrbit.orbit,
          templateMappingBinPcs: newPcsInOrbit.templateMappingBinPcs,
          nMapping: newPcsInOrbit.nMapping
        })

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
        // TODO countStabilizers
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

  /**
   * TODO this method do 2 things... change this
   *
   * @param pcs
   * @param index
   */
  toggleInnerIndexOrSetIPivot(pcs: IPcs, index: number): IPcs {
    // inner index (no mapping index)
    let newPcs: IPcs
    if (pcs.abinPcs[index] === 0) {
      newPcs = pcs.toggleIndexPC(index)
      if (pcs.orbit?.groupAction) {
        // newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
        newPcs = ManagerPcsService.makeNewInstanceOf(newPcs, pcs.orbit.groupAction, pcs.iPivot);
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
    return pcs.detach()
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
   * @param groupAction where to find pcs (for cloning or not)
   * @param newPivot
   * @private
   */
  public static makeNewInstanceOf(pcs: IPcs, groupAction: GroupAction, newPivot ?: number ) {
    let newPcsInOrbit = groupAction.getIPcsInOrbit(pcs)

    if (newPcsInOrbit.iPivot !== pcs.iPivot) {
      // change pivot
      let clonePcs = new IPcs({
        binPcs: newPcsInOrbit.abinPcs,
        iPivot: newPivot,  // <= changed
        orbit: newPcsInOrbit.orbit,
        templateMappingBinPcs: newPcsInOrbit.templateMappingBinPcs,
        nMapping: newPcsInOrbit.nMapping
      })
      // change pivot impact stabilizer !!??!!!
      // TODO Big Problem here, maybe make this property as computed (see PCS page)
      // same count stab.operations
      //clonePcs.stabilizer = newPcsInOrbit.stabilizer  // TODO check with unit test !
      clonePcs.countStabilizers = newPcsInOrbit.countStabilizers
      return clonePcs
    }
    return newPcsInOrbit // readonly by default, so can be shared
  }

}
