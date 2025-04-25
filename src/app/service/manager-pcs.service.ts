import {Injectable} from '@angular/core';
import {IPcs, TDirection} from "../core/IPcs";
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
    // let pcsComplement =   pcs.complement()
    // const pivot = pcsComplement.iPivot
    // if (pcs.orbit?.groupAction) {
    //   pcsComplement = pcs.orbit.groupAction.getIPcsInOrbit(pcsComplement)
    //   if (pcsComplement.iPivot !== pivot) {
    //     pcsComplement = pcsComplement.cloneWithNewPivot(pivot)
    //   }
    // }
    return pcs.complement()
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
      newPcs = newPcs.getOrMakeInstanceFromOrbitOfGroupActionOf(pcs.orbit?.groupAction);
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
    return MusaicOperation.affineOp(pcs, a, t)
  }



}
