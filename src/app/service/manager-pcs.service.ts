import {Injectable} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {MusaicOperation} from "../core/MusaicOperation";

@Injectable({
  providedIn: 'root'
})
export class ManagerPcsService {

  constructor() {
  }

  transformeByMxT0(pcs: IPcs, a: number): IPcs {
    return this.doTransformAffine(pcs, a, 0)
  }

  sav_transformeByMxT0(pcs: IPcs, a: number): IPcs {
    // if not isDetachedOfGroupAction() get newPcs resulting of group action
    let newPcs = pcs.affineOp(a, 0)
    if (pcs.orbit?.groupAction) {
      let newPcsInOrbit = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
      // set pivot from pivot obtained by transposition
      // rem: pivot is not signifiant for pcs identity
      if (newPcs.iPivot !== undefined && newPcs.iPivot !== newPcsInOrbit.iPivot) {
        // change pivot, so as immutable, make a new instance
        // newPcsInOrbit.setPivot(newPcs.iPivot) <== BAD idea, side effect !!
        newPcsInOrbit = new IPcs({
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

  translateByM1Tx(pcs: IPcs, t: number): IPcs {
    return this.doTransformAffine(pcs, 1, t)
  }

  complement(pcs: IPcs): IPcs {
    let newPcs = pcs.complement()
    if (pcs.orbit?.groupAction) {
      newPcs = pcs.orbit.groupAction.getIPcsInOrbit(newPcs)
    }
    // lost iPivot, set a new
    const newPivot = newPcs.getPivotFromSymmetryForComplement()
    if (newPivot >= 0) {
      return new IPcs({
        binPcs: newPcs.abinPcs,
        iPivot: newPivot,
        orbit: newPcs.orbit,
        templateMappingBinPcs: newPcs.templateMappingBinPcs,
        nMapping: newPcs.nMapping
        // TODO stabilizerCardinal
      })
    }
    return newPcs
  }

  /**
   * Change state of pcs, by set a new pivot
   * @param pcs
   * @param direction
   */
  modulation(pcs: IPcs, direction: number): IPcs {
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
            orbit: pcs.orbit,
            templateMappingBinPcs: pcs.templateMappingBinPcs,
            nMapping: pcs.nMapping
          })
      } else {
        throw new Error("Invalid iPivot : " + index)
      }
    }
    return newPcs
  }

  toggleIndexFromMapped(pcs: IPcs, index: number): IPcs {
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
  doDetach(pcs: IPcs): IPcs {
    return pcs.cloneDetached()
  }

  doTransformAffine(pcs: IPcs, a: number, t: number): IPcs {
    let newPcs = pcs.affineOp(a, t)
    const savPivot = newPcs.getPivot()
    if (pcs.orbit?.groupAction) {
      newPcs = ManagerPcsService.makeNewInstanceOf(newPcs, pcs.orbit.groupAction, savPivot);
    }
    return newPcs
  }

  symmetry(pcs: IPcs): IPcs {
    let pcsSymmetry: IPcs | undefined = undefined

    let allModulations: IPcs[] = [pcs]
    let cardinal = pcs.cardOrbitMode()

    for (let degree = 1; degree < cardinal; degree++) {
      pcs = pcs.modulation(IPcs.NEXT_DEGREE)
      allModulations.push(pcs)
    }

    let pcsWithPivotInSymmetry: IPcs[] = []
    let opM11_T0 = MusaicOperation.stringOpToMusaicOperation(`M1${pcs.n - 1}-T0`) // "M11-T0"

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
      let minimalStabilizerOperation = MusaicOperation.stringOpToMusaicOperation("M1-T0")
      const n = pcs.n
      for (let i = 1; i < n && !findMinimal; i++) {
        for (pcs of allModulations) {
          // search first stabilizer op M11-Ti
          let operation = MusaicOperation.stringOpToMusaicOperation(`M${pcs.n - 1}-T${i}`) // M11-Tk
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
      if (pcs.isDetached()) {
        const cpf = pcs.cyclicPrimeForm()
        // cyclic prim form detached
        pcsSymmetry = new IPcs({
          binPcs: cpf.abinPcs,
          nMapping: cpf.nMapping,
          templateMappingBinPcs: cpf.templateMappingBinPcs
        })
      } else {
        const cpf = pcs.cyclicPrimeForm()
        // get cyclic prime form in its orbit
        pcsSymmetry = ManagerPcsService.makeNewInstanceOf(cpf, pcs.orbit.groupAction!, cpf.iPivot)
      }
    }
    return pcsSymmetry
  }


  /**
   * Build instance of IPcs from pcs and group action (king of clone, with pivot may be changed)
   * @param pcs to find image in action group
   * @param groupAction where to find pcs (for cloning or not)
   * @param newPivot
   * @private
   */
  public static makeNewInstanceOf(pcs: IPcs, groupAction: GroupAction, newPivot ?: number) {
    let newPcsInOrbit = groupAction.getIPcsInOrbit(pcs)

    const theNewPivot = newPivot === undefined ? pcs.iPivot : newPivot

    if (newPcsInOrbit.iPivot !== theNewPivot) {
      // change pivot
      let clonePcs = new IPcs({
        binPcs: newPcsInOrbit.abinPcs,
        iPivot: theNewPivot,  // <= changed
        orbit: newPcsInOrbit.orbit,
        templateMappingBinPcs: newPcsInOrbit.templateMappingBinPcs,
        nMapping: newPcsInOrbit.nMapping
      })
      return clonePcs
    }
    return newPcsInOrbit // readonly by default, so can be shared
  }

}
