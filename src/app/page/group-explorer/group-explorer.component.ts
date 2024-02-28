import { Component } from '@angular/core';
import {MusaicPcsOperation} from "../../core/MusaicPcsOperation";
import {Group} from "../../core/Group";
import {GroupAction} from "../../core/GroupAction";
import {Orbit} from "../../core/Orbit";
import {ISortedOrbits} from "../../core/ISortedOrbits";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {MusaicComponent} from "../../component/musaic/musaic.component";
import {UiOrbitComponent} from "../../component/orbit/ui-orbit.component";

@Component({
  selector: 'app-group-explorer',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    MusaicComponent,
    UiOrbitComponent
  ],
  templateUrl: './group-explorer.component.html',
  styleUrl: './group-explorer.component.css'
})
export class GroupExplorerComponent {
  n = 12
  primesWithN = [1, 5, 7, 11]
  opMultChoices= [1]
  opTransChoices = [0]
  opComplement = false
  // array with neutral operation
  groupOperations = [new MusaicPcsOperation(this.n, 1, 0)]
  groupAction :  GroupAction | null
  orbitsPartitions : ISortedOrbits[] = []
  preReactOrbits : Orbit[] = []
  waitingCompute = false
  stabilizers = []
  showOrbitBy = "" // for UI
  debug = false

  opForm: FormGroup;
  toggleShowHide : string = "hidden"

  protected readonly Math = Math;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.opForm = this.fb.group({
      opSelectedByUser: this.fb.array([])
    });
  }

  doubleRaf(callback : FrameRequestCallback) {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback)
    })
  }

  onChangeN($event: any) {
    this.n = Number.parseInt($event.target.value) ?? 12
    this.primesWithN = Group.phiEulerElements(this.n);
    this.opMultChoices = [1];
    this.opTransChoices = [0];
    this.groupAction = null
    this.orbitsPartitions = []
    this.preReactOrbits = []
    this.stabilizers = []
    this.debug = true
    this.buildAllOperationsOfGroup();

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
      this.stabilizers = []
      this.showOrbitBy = ''
      this.nextTick()
    });
  }

  nextTick =  () => {
     this.waitingCompute = false
    this.toggleShowHide = 'hidden'
  }

  showOrbits(byCriteria = "MotifStabilizer") {
    if (! this.groupAction) {
      this.buildAllOperationsOfGroup()
    } else {
      this.waitingCompute = true
      // see https://github.com/vuejs/vue/issues/9200
      this.doubleRaf(() => {
        //this.stabilizers = this.groupAction.stabilizers
        //this.fixedPcsInPrimeForms = this.groupAction.stabilizers.fixedPcsInPrimeForm()
        if (byCriteria === "MotifStabilizer") {
          this.orbitsPartitions = this.groupAction!.orbitsSortedByMotifStabilizers
          this.showOrbitBy = "set of motifs stabilizer"
        } else if (byCriteria === "Stabilizer") {
          this.orbitsPartitions = this.groupAction!.orbitsSortedByStabilizers
          this.showOrbitBy = "set of stabilizers"
        } else if (byCriteria === "Cardinal") {
          this.orbitsPartitions = this.groupAction!.orbitsSortedByCardinal
          this.showOrbitBy = "cardinal"
        }
        this.nextTick()
      })
    }
  }

  /**
   * @return {boolean} true iif one value of opTransChoices is prime with n
   */
  opTranspositionChoicesHasAtLeastOneValuePrimeWithN(): boolean {
    return this.opTransChoices.some(t => (t===1) ||  (t > 0) && (this.n % t) !== 0)
  }

  /**
   * Get generated set operations of group, as selected by user
   * @return {MusaicPcsOperation[]} array of MusaicPcsOperation
   */
  getGeneratedSetOperationsFromUI(): MusaicPcsOperation[] {
    let someOperations = [];

    // add complemented operation to neutral op if complement operation is selected
    if (this.opComplement) {
      someOperations.push(new MusaicPcsOperation(this.n, 1, 0, true))
      this.opTransChoices = [0, 1]
    }
    // include neutral operation (constant pre-selected in UI)
    for (let i = 0; i < this.opMultChoices.length; i++)
      for (let j = 0; j < this.opTransChoices.length; j++) {
        someOperations.push(new MusaicPcsOperation(this.n, this.opMultChoices[i], this.opTransChoices[j]))
      }
    return someOperations
  }

  makeArray(n : number) : number[] {
    const arr = new Array(n)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i
    }
    return arr
  }

  /**
   * Change multiplication operation
   * @param op number
   * @param event
   */
  changeOpMultChoices(op: number, event: any) {
    // see ?  https://stackoverflow.com/questions/43423333/angular-how-to-get-the-multiple-checkbox-values
    const index = this.opMultChoices.findIndex(v => v==op)
    if (index < 0 && event.target.checked) {
      this.opMultChoices.push(op)
    } else if (index > 0) {
      this.opMultChoices.splice(index, 1)
    }
    this.buildAllOperationsOfGroup()
  }

  changeOpTranslationChoices(t: number, $event: any) {
    const index = this.opTransChoices.findIndex(v => v==t)
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
