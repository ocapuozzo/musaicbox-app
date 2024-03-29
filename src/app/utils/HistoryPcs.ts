import {IPcs} from "../core/IPcs";

export class HistoryPcs {
  history: IPcs[] = []
  currentIndexPast = -1
  debug = false

  constructor() {
  }

  pushInPast(pcs: IPcs) {
    // delete all psc from the future (in case of previous undos)
    if (this.currentIndexPast <= this.history.length - 1) {
      this.history.splice(this.currentIndexPast+1)
    }
    // put this actualPcs into paste
    this.history.push(pcs)
    // ref to it
    this.currentIndexPast = this.history.length - 1

    if (this.debug) this.printStateOnConsole();
  }

  unDoToPresent(): IPcs | undefined {
    if (this.currentIndexPast > 0) {
      --this.currentIndexPast
    }

    if (this.debug) this.printStateOnConsole();

    if (this.currentIndexPast >= 0) {
      return this.history[this.currentIndexPast]
    }
    return undefined
  }

  reDoToPresent(): IPcs | undefined {
    if (this.currentIndexPast < this.history.length - 1) {
      ++this.currentIndexPast
    }
    if (this.debug) this.printStateOnConsole();

    return this.history[this.currentIndexPast]
  }

  canUndo() : boolean {
    return this.currentIndexPast > 0
  }

  canRedo() : boolean {
    return this.currentIndexPast < this.history.length - 1
  }


  private printStateOnConsole() {
    console.log("this.history = " + this.history)
    console.log("this.currentIndexPast = " + this.currentIndexPast)
  }

}
