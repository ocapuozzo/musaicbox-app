import {MusaicOperation} from "../core/MusaicOperation";
import {GroupAction} from "../core/GroupAction";
import {ISortedOrbits} from "../core/ISortedOrbits";
import {Orbit} from "../core/Orbit";

export interface IDataExplorerState {
  n: number
  primesWithN: number[]
  opMultChoices: string[]
  opTransChoices: number[]
  opComplement: boolean
  groupOperations : MusaicOperation[]
  groupAction: GroupAction | null
  orbitsPartitions: ISortedOrbits[]
  preReactOrbits: Orbit[]
  actionCommand : string
}

export interface IStoragePage88 {
  selectedOps: string[]
  indexTab : number
  indexSelectedOctotrope : number
}

