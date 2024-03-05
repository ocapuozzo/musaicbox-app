import {MusaicPcsOperation} from "../core/MusaicPcsOperation";
import {GroupAction} from "../core/GroupAction";
import {ISortedOrbits} from "../core/ISortedOrbits";
import {Orbit} from "../core/Orbit";
import {Stabilizer} from "../core/Stabilizer";

export interface IDataExplorerState {

  n: number
  primesWithN: number[]
  opMultChoices: number[]
  opTransChoices: number[]
  opComplement: boolean
  groupOperations : MusaicPcsOperation[]
  groupAction: GroupAction | null
  orbitsPartitions: ISortedOrbits[]
  preReactOrbits: Orbit[]
  // stabilizers : Stabilizer[]

}
