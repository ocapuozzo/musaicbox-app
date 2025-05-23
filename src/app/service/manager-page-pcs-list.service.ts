import {EventEmitter, Injectable, Output} from '@angular/core';
import {IPcs} from "../core/IPcs";
import {IElementListPcs} from "./IElementListPcs";

@Injectable({
  providedIn: 'root'
})
export class ManagerPagePcsListService {

  @Output() updatePcsListEvent = new EventEmitter<Map<string, IElementListPcs>>();

  labeledListPcs= new Map<string, IElementListPcs>()

  private list3chordsGenerated: number[] = [];
  private list4chordsGenerated: number[] = [];
  private listStabilizersFixedPcs: string[] = [];
  private listModesGenerated: number[] = [];

  constructor() { }

  addPcs(title: string, pcs: IPcs | null, displayPivot = false) {
    if (! this.labeledListPcs.has(title)) {
      this.labeledListPcs.set(title,{drawPivot:displayPivot, pcsList: pcs ? [pcs] : []})
    } else {
      if (pcs) {
        this.labeledListPcs.get(title)?.pcsList.push(pcs)
      }
    }
    this.updatePcsListEvent.emit(this.labeledListPcs)
  }

  removePcs(pcs: IPcs) {
    for (const [title, eltList] of this.labeledListPcs) {
      const index = eltList.pcsList.findIndex((p) => p.id === pcs.id )
      if (index >= 0) {
        eltList.pcsList.splice(index,1)
        if (eltList.pcsList.length === 0) {
          this.labeledListPcs.delete(title)
        }
        this.updatePcsListEvent.emit(this.labeledListPcs)
        break
      }
    }
  }

  clearLists() {
    this.labeledListPcs.clear()
    this.updatePcsListEvent.emit(this.labeledListPcs)
    this.list4chordsGenerated = []
    this.list3chordsGenerated = []
    this.listStabilizersFixedPcs = []
    this.listModesGenerated = []
  }

  isAlreadyCompute3Chords(idPcs: number) {
    return this.list3chordsGenerated.includes(idPcs)
  }

  isAlreadyCompute4Chords(idPcs: number) {
    return this.list4chordsGenerated.includes(idPcs)
  }

  addCompute3Chords(idPcs: number) {
    if (! this.list3chordsGenerated.includes(idPcs)) {
      this.list3chordsGenerated.push(idPcs)
    }
  }

  addCompute4Chords(idPcs: number) {
    if (! this.list4chordsGenerated.includes(idPcs)) {
      this.list4chordsGenerated.push(idPcs)
    }
  }

  addStabilizersFixedPcs(stab : string) {
    if (! this.listStabilizersFixedPcs.includes(stab)) {
      this.listStabilizersFixedPcs.push(stab)
    }
  }

  addModesOf(idPcs: number) {
    if (! this.listModesGenerated.includes(idPcs)) {
      this.listModesGenerated.push(idPcs)
    }
  }


  isAlreadyShowFixedPcs(stabilizers: string) {
    return this.listStabilizersFixedPcs.includes(stabilizers);
  }

  isAlreadyComputeModes(pcs: IPcs) {
    return this.listModesGenerated.includes(pcs.id);
  }

  clearLists3Chord() {
    this.clearLists()
  }
}
