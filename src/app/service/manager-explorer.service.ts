import {EventEmitter, Injectable, Output} from '@angular/core';
import {IDataExplorerState} from "./IDataState";
import {MusaicOperation} from "../core/MusaicOperation";
import {GroupAction} from "../core/GroupAction";
import {ISortedOrbits} from "../core/ISortedOrbits";
import {Orbit} from "../core/Orbit";
import {Stabilizer} from "../core/Stabilizer";

@Injectable({
  providedIn: 'root'
})
export class ManagerExplorerService implements IDataExplorerState{

  n = 12
  primesWithN = [1, 5, 7, 11]
  opMultChoices = ["M1"]
  opTransChoices = [1]
  opComplement = false
  groupOperations : MusaicOperation[]
  groupAction: GroupAction | null
  orbitsPartitions: ISortedOrbits[]
  preReactOrbits: Orbit[]
  stabilizers : Stabilizer[]
  actionCommand: string;

  @Output() saveExplorerConfigEvent = new EventEmitter();


  constructor() {
  }

  saveConfig(x: {
    n: number,
    primesWithN: number[],
    opMultChoices: string[],
    opTransChoices: number[],
    opComplement: boolean,
    groupOperations : MusaicOperation[]
    groupAction: GroupAction | null
    orbitsPartitions: ISortedOrbits[]
    preReactOrbits: Orbit[]
    action:string
  }) {
    this.n = x.n ?? 12
    this.primesWithN = x.primesWithN ?? [1, 5, 7, 11]
    this.opMultChoices = x.opMultChoices ?? [1]
    this.opTransChoices = x.opTransChoices ?? [1]
    this.opComplement = x.opComplement ?? false
    this.groupOperations = x.groupOperations ??  []
    this.groupAction = x.groupAction ?? null
    this.orbitsPartitions = x.orbitsPartitions ?? []
    this.preReactOrbits = x.preReactOrbits ?? []
    this.actionCommand = x.action
  }

  getConfig() : IDataExplorerState {
    return {
      n: this.n,
      primesWithN: this.primesWithN,
      opMultChoices: this.opMultChoices,
      opTransChoices: this.opTransChoices,
      opComplement: this.opComplement,
      groupOperations : this.groupOperations,
      groupAction :  this.groupAction,
      orbitsPartitions : this.orbitsPartitions,
      preReactOrbits: this.preReactOrbits,
      actionCommand: this.actionCommand
    }
  }

  doSaveConfig() {
    // call group explorer component to save config
    this.saveExplorerConfigEvent.emit()
  }
}
