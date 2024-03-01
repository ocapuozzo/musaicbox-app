import {IPcs} from "../core/IPcs";
import {ChordName} from "../core/ChordName";

export class Analyse {

  static ROMAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

  static getListChords(pcs: IPcs, nOfPitches: number): Map<string, IPcs[]> {
    const chordsByDegree = new Map<string, IPcs[]>()
    const cardinal = pcs.cardinal

    let pcsWorking = pcs
    for (let nbDegree = 0; nbDegree < cardinal; nbDegree++) {
      let keysChord: string[]
      if (nOfPitches == 3) {
        keysChord = ChordName.getKeysChord(pcsWorking, 3)
      } else {
        keysChord = ChordName.getKeysChord(pcsWorking, 4)
      }
      for (const keyChord of keysChord) {
        const chord = new IPcs({strPcs:keyChord})
        Analyse.addPcs(chordsByDegree, nbDegree + 1, chord.translation(pcsWorking.iPivot ?? 0));
      }
      pcsWorking = pcsWorking.modulation(IPcs.NEXT_DEGREE)
    }
    return chordsByDegree
  }

  static getList4Chords(pcs: IPcs): Map<string, IPcs[]> {
     return Analyse.getListChords(pcs, 4)
  }

  static getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
    return Analyse.getListChords(pcs, 3)
  }

  static addPcs(chordsByDegree: Map<string, IPcs[]>, i: number, pcs: IPcs) {
    const key = Analyse.ROMAIN[i - 1]
    if (!chordsByDegree.has(key)) {
      chordsByDegree.set(key, [pcs])
    } else {
      chordsByDegree.get(key)?.push(pcs)
    }
  }

}
