import {Component} from '@angular/core';
import {MusaicPcsOperation} from "../../core/MusaicPcsOperation";
import {Group} from "../../core/Group";
import {GroupAction} from "../../core/GroupAction";
import {Orbit} from "../../core/Orbit";
import {ISortedOrbits} from "../../core/ISortedOrbits";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {UiOrbitComponent} from "../../component/ui-orbit/ui-orbit.component";
import {ManagerExplorerService} from "../../service/manager-explorer.service";
import {MatLabel} from "@angular/material/form-field";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButton} from "@angular/material/button";
import {MotifStabilizer} from "../../core/MotifStabilizer";
import {group} from "@angular/animations";

@Component({
  selector: 'app-group-explorer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MusaicComponent,
    UiOrbitComponent,
    MatLabel,
    MatProgressSpinner,
    MatButton,
  ],
  templateUrl: './group-explorer.component.html',
  styleUrl: './group-explorer.component.css'
})
export class GroupExplorerComponent {
  n = 12
  primesWithN = [1, 5, 7, 11]
  primesWithNOperations: string[] = ["M1", "M5", "M7", "M11", "CM1", "CM5", "CM7", "CM11"]

  // opMultChoices = [1]
  opMultChoices: string[] = ["M1"]
  opTransChoices = [0]
  opComplement = false
  // array with neutral operation
  groupOperations = [new MusaicPcsOperation(this.n, 1, 0)]
  groupAction: GroupAction | null
  orbitsPartitions: ISortedOrbits[] = []
  preReactOrbits: Orbit[] = []
  waitingCompute = false

  criteriaEquiv = "" // for UI
  debug = false

  toggleShowHide: string = "hidden"

  protected readonly Math = Math;

  constructor(private readonly managerExplorerService: ManagerExplorerService) {
    this.managerExplorerService.saveExplorerConfigEvent.subscribe( () => {
      this.saveConfig();
    })
  }


  ngOnInit() {
    this.updateConfig();
  }

  private saveConfig() {
    this.managerExplorerService.saveConfig({
      n: this.n,
      primesWithN: this.primesWithN,
      opMultChoices: this.opMultChoices,
      opTransChoices: this.opTransChoices,
      opComplement: this.opComplement,
      groupOperations: this.groupOperations,
      groupAction: this.groupAction,
      orbitsPartitions: this.orbitsPartitions,
      preReactOrbits: this.preReactOrbits
    })
  }

  private updateConfig() {
    const currentState = this.managerExplorerService.getConfig()

    this.n = currentState.n ?? 12
    this.primesWithN = currentState.primesWithN ?? [1, 5, 7, 11]
    this.opMultChoices = currentState.opMultChoices ?? [1]
    this.opTransChoices = currentState.opTransChoices ?? [0]
    this.opComplement = currentState.opComplement ?? false
    this.groupOperations = currentState.groupOperations ?? [new MusaicPcsOperation(this.n, 1, 0)]
    this.groupAction = currentState.groupAction ?? null
    this.orbitsPartitions = currentState.orbitsPartitions ?? []
    this.preReactOrbits = currentState.preReactOrbits ?? []
  }

  doubleRaf(callback: FrameRequestCallback) {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback)
    })
  }

  onChangeN($event: any) {
    this.n = Number.parseInt($event.target.value) ?? 12
    this.primesWithN = Group.phiEulerElements(this.n);
    this.primesWithNOperations = []
    for (let i = 0; i < this.primesWithN.length; i++) {
      this.primesWithNOperations.push(`M${this.primesWithN[i]}`)
    }
    for (let i = 0; i < this.primesWithN.length; i++) {
      this.primesWithNOperations.push(`CM${this.primesWithN[i]}`)
    }
    this.opMultChoices = ["M1"];
    this.opTransChoices = [0];
    this.groupAction = null
    this.orbitsPartitions = []
    this.preReactOrbits = []
    this.debug = true
    this.buildAllOperationsOfGroup();
    this.saveConfig();
  }

  /**
   * Get all operations group from user choices
   *
   */
  buildAllOperationsOfGroup() {
    if (this.waitingCompute) return
    // see https://github.com/vuejs/vue/issues/9200
    this.waitingCompute = true
    this.doubleRaf(() => {
      let local_groupOperations = Group.buildOperationsGroupByCaylayTable(this.getGeneratedSetOperationsFromUI());
      let start = 0
      if (this.debug) {
        start = new Date().getTime();
      }
      let local_group = new GroupAction({n: this.n, someMusaicOperations: local_groupOperations});
      if (this.debug) {
        let end = new Date().getTime()
        let diff = end - start;
        console.log("duration : " + String(diff / 1000) + " secondes")
      }
      this.groupOperations = local_groupOperations;
      this.groupAction = local_group
      this.preReactOrbits = this.groupAction.orbits
      this.orbitsPartitions = []
      this.criteriaEquiv = ''

      this.saveConfig();
      this.nextTick()
    });
  }

  nextTick = () => {
    this.waitingCompute = false
    this.toggleShowHide = 'hidden'
  }

  showOrbits(byCriteria = "MotifStabilizer") {
    if (!this.groupAction) {
      this.buildAllOperationsOfGroup()
    } else {
      this.waitingCompute = true
      // see https://github.com/vuejs/vue/issues/9200
      this.doubleRaf(() => {
        //this.stabilizers = this.groupAction.stabilizers
        //this.fixedPcsInPrimeForms = this.groupAction.stabilizers.fixedPcsInPrimeForm()
        if (byCriteria === "MotifStabilizer") {
          this.orbitsPartitions = this.groupAction!.orbitsSortedByMotifStabilizers
          this.criteriaEquiv = "set of meta-stabilizer"
        } else if (byCriteria === "Stabilizer") {
          this.orbitsPartitions = this.groupAction!.orbitsSortedByStabilizers
          this.criteriaEquiv = "set of stabilizers"
        } else if (byCriteria === "Cardinal") {
          this.orbitsPartitions = this.groupAction!.orbitsSortedByCardinal
          this.criteriaEquiv = "cardinal"
        }
        this.saveConfig();
        this.nextTick()
      })
    }
  }

  /**
   * @return {boolean} true iif one value of opTransChoices is prime with n
   */
  opTranspositionChoicesHasAtLeastOneValuePrimeWithN(): boolean {
    return this.opTransChoices.some(t => (t === 1) || (t > 0) && (this.n % t) !== 0)
  }

  /**
   * Get generated set operations of group, as selected by user
   * @return {MusaicPcsOperation[]} array of MusaicPcsOperation
   */
  getGeneratedSetOperationsFromUI(): MusaicPcsOperation[] {
    let someOperations = [];
    for (let i = 0; i < this.opMultChoices.length; i++)
      for (let j = 0; j < this.opTransChoices.length; j++) {
        const a = this.opMultChoices[i].startsWith("C") ?
          parseInt(this.opMultChoices[i].substring(2)) :
          parseInt(this.opMultChoices[i].substring(1))
        const complement = this.opMultChoices[i].startsWith("C")
        someOperations.push(new MusaicPcsOperation(this.n, a, this.opTransChoices[j], complement))
      }
    return someOperations
  }

  makeArray(n: number): number[] {
    return [...Array(n).keys()]
  }

  /**
   * Change multiplication operation
   * @param op number
   * @param event
   */
  changeOpMultChoices(op: string, event: any) {
    // this.opMultChoices = []
    const index = this.opMultChoices.findIndex(v => v === op)
    if (index < 0 && event.target.checked) {
      this.opMultChoices.push(op)
    } else if (index > 0) {
      this.opMultChoices.splice(index, 1)
    }

    // sort. Ex : M1 < M5 < CM1
    this.opMultChoices.sort((op1: string, op2: string) => {
      let w1 = 0;
      let w2 = 0;
      if (op1.startsWith('C'))
        w1 = this.n // max coef
      if (op2.startsWith('C'))
        w2 = this.n

      const wa1 = parseInt(op1.substring(op1.startsWith('C') ? 2 : 1))
      const wa2 = parseInt(op2.substring(op2.startsWith('C') ? 2 : 1))

      return (w1 + wa1) - (w2 + wa2);
    })
    this.buildAllOperationsOfGroup()
  }

  /**
   * When user select/unselect a mult value (Ma or CMa)
   * @param t
   * @param $event
   */
  changeOpTranslationChoices(t: number, $event: any) {
    const index = this.opTransChoices.findIndex(v => v == t)
    if (index < 0 && $event.target.checked) {
      this.opTransChoices.push(t)
    } else if (index >= 0) {
      this.opTransChoices.splice(index, 1)
    }
    this.buildAllOperationsOfGroup()
  }

  changeOpComplementChoice($event: any) {
    this.opComplement = $event.target.checked
    this.buildAllOperationsOfGroup()
  }

}
