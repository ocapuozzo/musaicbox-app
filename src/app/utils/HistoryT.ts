
export class HistoryT<T> {
  timeLine: T[] = []
  currentIndexPast = -1
  debug = false

  constructor() {
  }

  pushIntoPresent(obj: T) {
    // delete all elements present into future (in case of previous undos)
    if (this.currentIndexPast <= this.timeLine.length - 1) {
      this.timeLine.splice(this.currentIndexPast+1)
    }
    // put element into time ligne
    this.timeLine.push(obj)
    // ref to it
    this.currentIndexPast = this.timeLine.length - 1

    if (this.debug) this.printStateOnConsole();
  }

  unDoToPresent(): T | undefined {
    if (this.currentIndexPast > 0) {
      this.currentIndexPast = this.currentIndexPast - 1
    }

    if (this.debug) this.printStateOnConsole();

    if (this.currentIndexPast >= 0) {
      return this.timeLine[this.currentIndexPast]
    }
    return undefined
  }

  reDoToPresent(): T | undefined {
    if (this.currentIndexPast < this.timeLine.length - 1) {
      ++this.currentIndexPast
    }
    if (this.debug) this.printStateOnConsole();

    return this.timeLine[this.currentIndexPast]
  }

  canUndo() : boolean {
    return this.currentIndexPast > 0
  }

  canRedo() : boolean {
    return this.currentIndexPast < this.timeLine.length - 1
  }

  getCurrent() : T | undefined {
    if (this.currentIndexPast >= 0) {
      return this.timeLine[this.currentIndexPast]
    }
    return undefined
  }

  getPrevCurrentPcs() {
    if (this.currentIndexPast > 0) {
      return this.timeLine[this.currentIndexPast -1]
    }
    return undefined
  }

  private printStateOnConsole() {
    console.log("this.timeLine = ", this.timeLine)
    console.log("this.currentIndexPast = ",this.currentIndexPast)
  }

}
