import {IPcs} from "../core/IPcs";
import {ChordNaming} from "../core/ChordNaming";

export class AnalyseChord {

  static ROMAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

  static getListChords(pcs: IPcs, nOfPitches: number): Map<string, IPcs[]> {
    const chordsByDegree = new Map<string, IPcs[]>()
    const cardinal = pcs.cardinal

    // unMap() if necessary, chords research work on n == 12
    let pcsWorking = pcs.n < 12 ? pcs.unMap() : pcs
    for (let nbDegree = 0; nbDegree < cardinal; nbDegree++) {
      let keysChords: string[]
      if (nOfPitches === 3) {
        keysChords = ChordNaming.getKeysChord(pcsWorking, 3)
      } else {
        keysChords = ChordNaming.getKeysChord(pcsWorking, 4)
      }
      if (keysChords.length == 0) {
        chordsByDegree.set(AnalyseChord.ROMAIN[nbDegree], [])
      } else for (const keyChord of keysChords) {
        const chord = new IPcs({strPcs:keyChord})
        AnalyseChord.addPcs(chordsByDegree, nbDegree + 1, chord.transposition(pcsWorking.iPivot ?? 0));
      }
      pcsWorking = pcsWorking.modulation(IPcs.NEXT_DEGREE)
    }
    return chordsByDegree
  }

  static getList4Chords(pcs: IPcs): Map<string, IPcs[]> {
     return AnalyseChord.getListChords(pcs, 4)
  }

  static getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
    return AnalyseChord.getListChords(pcs, 3)
  }

  static addPcs(chordsByDegree: Map<string, IPcs[]>, i: number, pcs: IPcs) {
    const key = AnalyseChord.ROMAIN[i - 1]
    if (!chordsByDegree.has(key)) {
      chordsByDegree.set(key, [pcs])
    } else {
      chordsByDegree.get(key)?.push(pcs)
    }
  }

}
