import {Injectable} from '@angular/core';
import {IPcs, TDirection} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {MusaicOperation} from "../core/MusaicOperation";

@Injectable({
  providedIn: 'root'
})
export class ManagerPcsService {

  constructor() {
  }

  transformByMxT0(pcs: IPcs, a: number): IPcs {
    return this.doTransformAffine(pcs, a, 0)
  }

  translateByM1Tx(pcs: IPcs, t: number): IPcs {
    return this.doTransformAffine(pcs, 1, t)
  }

  complement(pcs: IPcs): IPcs {
    let pcsComplement =   pcs.complement()
    const pivot = pcsComplement.iPivot
    if (pcs.orbit?.groupAction) {
      pcsComplement = pcs.orbit.groupAction.getIPcsInOrbit(pcsComplement)
      if (pcsComplement.iPivot !== pivot) {
        pcsComplement = pcsComplement.cloneWithNewPivot(pivot)
      }
    }
    return pcsComplement
  }

  /**
   * Change state of pcs, by set a new pivot
   * @param pcs
   * @param direction
   */
  modulation(pcs: IPcs, direction: TDirection): IPcs {
    // return new instance, even if same pcs (<> pivot) for reactive update ui by angular
    // with same orbit
    return pcs.modulation(direction)
  }

  changePivotBy(pcs: IPcs, index: number) {
    if (index < pcs.n && index >= 0 && pcs.vectorPcs[index] === 1) {
      // change pivot only
      return pcs.cloneWithNewPivot(index)
    } else {
      throw new Error("Invalid iPivot : " + index)
    }
  }

  toggleIndex(pcs: IPcs, index: number): IPcs {
    let newPcs = pcs.toggleIndexPC(index)
    if (pcs.orbit?.groupAction) {
      newPcs = ManagerPcsService.getOrMakeInstanceFromOrbitOfGroupActionOf(newPcs, pcs.orbit?.groupAction, newPcs.getPivot());
    }
    return newPcs
  }

  /**
   * Get new instance àf this argument, with "empty" orbit
   * @param pcs a PCS coming from orbit, or not... (in this last case, is "simple" clone)
   */
  doDetach(pcs: IPcs): IPcs {
    return pcs.cloneDetached()
  }

  doTransformAffine(pcs: IPcs, a: number, t: number): IPcs {
    // let newPcs = pcs.affineOp(a, t)
    let pcsPermuted = MusaicOperation.affineOp(pcs, a, t)
    const pivot = pcsPermuted.iPivot
    if (pcs.orbit?.groupAction) {
          pcsPermuted = pcs.orbit.groupAction.getIPcsInOrbit(pcsPermuted)
          if (pcsPermuted.iPivot !== pivot) {
            pcsPermuted = pcsPermuted.cloneWithNewPivot(pivot)
          }
        }
    return pcsPermuted
  }



  /**
   * Get instance of IPcs from pcs given and group action (if pivot not same as pcs given, make a new instance)
   * @param pcs to find image in action group
   * @param groupAction where to find pcs (for cloning or not)
   * @param newPivot
   * @private
   */
  public static getOrMakeInstanceFromOrbitOfGroupActionOf(pcs: IPcs, groupAction: GroupAction, newPivot ?: number) {
    let newPcsInOrbit = groupAction.getIPcsInOrbit(pcs)

    const theNewPivot = newPivot === undefined ? pcs.iPivot : newPivot

    if (newPcsInOrbit.iPivot !== theNewPivot) {
      return newPcsInOrbit.cloneWithNewPivot(theNewPivot)
    }
    return newPcsInOrbit // readonly by default, so can be shared
  }

}
