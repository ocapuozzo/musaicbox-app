import {IPcs} from "../core/IPcs";

export class HistoryPcs {
  history: IPcs[] = []
  currentIndexPast = -1

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

    // this.printStateOnConsole();
  }

  unDoToPresent(): IPcs | undefined {
    if (this.currentIndexPast > 0) {
      --this.currentIndexPast
    }

    // this.printStateOnConsole();

    if (this.currentIndexPast >= 0) {
      return this.history[this.currentIndexPast]
    }
    return undefined
  }

  reDoToPresent(): IPcs | undefined {
    if (this.currentIndexPast < this.history.length - 1) {
      ++this.currentIndexPast
    }
    this.printStateOnConsole()
    return this.history[this.currentIndexPast]
  }

  private printStateOnConsole() {
    console.log("this.history = " + this.history)
    console.log("this.currentIndexPast = " + this.currentIndexPast)
  }
}
