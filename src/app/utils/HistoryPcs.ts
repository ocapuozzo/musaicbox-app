import {IPcs} from "../core/IPcs";

export class HistoryPcs {
  history: IPcs[] = []
  currentIndexPast = -1

  constructor() {
  }

  pushInPast(pcs: IPcs) {
    // delete all psc from the future (in case of previous undos)
    if (this.currentIndexPast === -1) {
      this.history = []
    } else if (this.currentIndexPast != this.history.length - 1) {
      this.history.splice(this.currentIndexPast)
    }
    // put this actualPcs into paste
    this.history.push(pcs)
    // ref to it
    this.currentIndexPast = this.history.length - 1
  }

  // TODO si plus de reDo, il semblerait que quelquechose soit fait quand même
  // à déboguer....

  unDoToPresent(actualPcs: IPcs): IPcs | undefined {
    if (this.currentIndexPast == this.history.length - 1) {
      this.history.push(actualPcs)
    }
    if (this.currentIndexPast >= 0) {
      return this.history[this.currentIndexPast--]
    }
    return undefined
  }

  reDoToPresent(): IPcs | undefined {
    if (this.currentIndexPast >= 0 && this.currentIndexPast < this.history.length - 2) {
      return this.history[++this.currentIndexPast + 1]
    }
    return undefined
  }
}
