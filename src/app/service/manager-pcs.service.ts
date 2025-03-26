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

  symmetry(pcs: IPcs): IPcs {
    let pcsSymmetry: IPcs | undefined = undefined

    let allModulations: IPcs[] = [pcs]
    let cardinal = pcs.cardOrbitMode()

    for (let degree = 1; degree < cardinal; degree++) {
      pcs = pcs.modulation("Next")
      allModulations.push(pcs)
    }

    let pcsWithPivotInSymmetry: IPcs[] = []
    let opM11_T0 = MusaicOperation.convertStringOpToMusaicOperation(`M1${pcs.n - 1}-T0`) // "M11-T0"

    allModulations.forEach(pcs => {
      if (opM11_T0.actionOn(pcs).id === pcs.id) {
        pcsWithPivotInSymmetry.push(pcs)
      }
    })
    if (pcsWithPivotInSymmetry.length === 0) {
      pcsSymmetry = pcsWithPivotInSymmetry[0]
    } else if (pcsWithPivotInSymmetry.length > 1) {
      pcsSymmetry = pcsWithPivotInSymmetry
        .map(pcs => this.doTransformAffine(pcs, 1, pcs.iPivot ?? 0))
        .sort(IPcs.compare)[0]
    } else {
      // search stab with M11-Tk, k > 0
      let findMinimal = false
      let minimalStabilizerOperation = MusaicOperation.convertStringOpToMusaicOperation("M1-T0")
      const n = pcs.n
      for (let i = 1; i < n && !findMinimal; i++) {
        for (pcs of allModulations) {
          // search first stabilizer op M11-Ti
          let operation = MusaicOperation.convertStringOpToMusaicOperation(`M${pcs.n - 1}-T${i}`) // M11-Tk
          if (operation.actionOn(pcs).id === pcs.id) {
            // pcs is fixed by operation, with -Tk minimal
            minimalStabilizerOperation = operation
            findMinimal = true
            break
          }
        }
      }
      if (findMinimal) {
        pcsSymmetry = this.doTransformAffine(pcs, 1, -minimalStabilizerOperation.t)
      }
    }
    // now check if pcsSymmetry is found
    // if not, get cyclic prime form
    if (!pcsSymmetry) {
      if (pcs.isComingFromAnOrbit()) {
        const cpf = pcs.cyclicPrimeForm()
        // get cyclic prime form in its orbit
        pcsSymmetry = ManagerPcsService.getOrMakeInstanceFromOrbitOfGroupActionOf(cpf, pcs.orbit.groupAction!, cpf.iPivot)
      } else {
        const cpf = pcs.cyclicPrimeForm()
        // cyclic prim detached of group action
        pcsSymmetry = cpf.cloneDetached()
      }
    }
    return pcsSymmetry
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
