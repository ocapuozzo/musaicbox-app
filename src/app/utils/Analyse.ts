import {IPcs} from "../core/IPcs";

export class Analyse {

  static getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
    const thirdChordByDegree = new Map<string, IPcs[]>()

    const binPcs = pcs.getMappedBinPcs()
    const n: number = binPcs.length

    for (let i = 0; i < binPcs.length; i++) {
      if (binPcs[i] == 1) {
        if (binPcs[(i + 3) % n] == 1) {
          // minor
          // search fifth
          if (binPcs[(i + 6) % n] == 1) {
            const pcs =
              new IPcs({strPcs: '' + i + ',' + ((i + 3) % n) + ',' + ((i + 6) % n)})
            this.addPcs(thirdChordByDegree, i, pcs);
          }
          if  (binPcs[(i + 7) % n] == 1) {
            const pcs =
              new IPcs({strPcs: '' + i + ',' + ((i + 3) % n) + ',' + ((i + 7) % n)})
            this.addPcs(thirdChordByDegree, i, pcs);
          }
          if  (binPcs[(i + 8) % n] == 1) {
            const pcs =
              new IPcs({strPcs: '' + i + ',' + ((i + 3) % n) + ',' + ((i + 8) % n)})
            this.addPcs(thirdChordByDegree, i, pcs);
          }
        }
        // major
        if (binPcs[(i + 4) % n] == 1) {
          // search fifth
          if (binPcs[(i + 6) % n] == 1) {
            const pcs =
              new IPcs({strPcs: '' + i + ',' + ((i + 4) % n) + ',' + ((i + 6) % n)})
            this.addPcs(thirdChordByDegree, i, pcs);
          }
          if  (binPcs[(i + 7) % n] == 1) {
            const pcs =
              new IPcs({strPcs: '' + i + ',' + ((i + 4) % n) + ',' + ((i + 7) % n)})
            this.addPcs(thirdChordByDegree, i, pcs);
          }
          if  (binPcs[(i + 8) % n] == 1) {
            const pcs =
              new IPcs({strPcs: '' + i + ',' + ((i + 4) % n) + ',' + ((i + 8) % n)})
            Analyse.addPcs(thirdChordByDegree, i, pcs);
          }
        }
      }
    }
    return thirdChordByDegree
  }

  static addPcs(thirdChordByDegree: Map<string, IPcs[]>, i: number, pcs: IPcs) {
    if (!thirdChordByDegree.has('' + i)) {
      thirdChordByDegree.set('' + i, [pcs])
    } else {
      thirdChordByDegree.get('' + i)?.push(pcs)
    }
  }
}
