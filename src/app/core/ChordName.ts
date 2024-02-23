import {IPcs} from "./IPcs";

const chordName: Map<string, string> = new Map<string, string>()
chordName.set('[0,3,7]', 'Minor triad')
chordName.set('[0,4,7]', 'Major triad')
chordName.set('[0,3,6]', 'Min Diminished triad')
chordName.set('[0,4,6]', 'Maj Diminished triad')
chordName.set('[0,3,8]', 'Min Augmented triad')
chordName.set('[0,4,8]', 'Maj Augmented triad')

export class ChordName {

  static NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  static NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  static INDEX_SHARP_FLAT = [1, 3, 6, 8, 10]

  /**
   * Get chord name from cyclic primeform of mapped representation
   * @param pcs
   * @return {string} chord name
   */
  static getChordName(pcs: IPcs): string {
    if (pcs.cardinal < 3) return ''
    let third = ''
    let fifth = ''
    let sixth = ''
    let seven = ""
    let eleven = ""
    let nine = ''
    let pivot = pcs.templateMappingBinPcs[pcs.iPivot ?? 0]
    let binPcs = pcs.getMappedBinPcs()
    let n = pcs.nMapping

    if (binPcs[(pivot + 3) % n] == 1) {
      // Major seven
      third = "min"
    }
    if (binPcs[(pivot + 4) % n] == 1) {
      // Major seven
      third = "Maj"
    }
    if (binPcs[(pivot + 7) % n] == 0) {
      if (binPcs[(pivot + 6) % n] == 1) {
        // Major seven
        fifth = "Diminished"
      } else if (binPcs[(pivot + 8) % n] == 1) {
        // Major seven
        fifth = "Aug"
      }
    }
    if (binPcs[(pivot + 9) % n] == 1) {
      // Major seven
      sixth = "6"
    }
    if (binPcs[(pivot + 8) % n] == 1) {
      // Major seven
      sixth = "m6"
    }
    if (binPcs[(pivot + n - 1) % n] == 1) {
      // Major seven
      seven = "M7"
    }
    // Minor seven ?
    if (binPcs[(pivot + n - 2) % n] == 1) {
      seven = '7'
    }

    if (third == '') {
      if (binPcs[(pivot + 1) % n] == 1) {
        nine = 'b9'
      } else if (binPcs[(pivot + 2) % n] == 1) {
        nine = 'sus9'
      }
      if (binPcs[(pivot + 5) % n] == 1) {
        nine = 'sus4'
      }
    }

    let chordName = `${third}${fifth}${sixth}${seven}${nine}${eleven}`.trim()

    if (chordName == 'minDiminished') {
      chordName = 'min Diminished' // flat 5th'
    } else if (chordName == 'minDiminished7') {
      chordName = 'ø7' //<sub>7♭5</sub>' // 'ø7'
    } else if (chordName == 'minDiminished6') {
      chordName = 'o' //'dim'  // 'o ø7'
    } else if (chordName == 'minDiminishedM7') {
      chordName = 'øM7' //'dim'  // 'o ø7'
    } else if (chordName == 'Maj7') {
      chordName = '7'
    } else if (chordName == 'MajM7') {
      chordName = 'Maj7'
    } else if (chordName == 'MajAug7') {
      chordName = '7Aug'  // 7#5  7+5
    } else if (chordName == 'MajAugM7') {
      chordName = 'AugM7'
    } else if (chordName == 'MajDiminished7') {
      chordName = '7b5'  // 7b5  7-5
    }

    let nameRoot = ''
    const indexNameRoot = pcs.iPivot != undefined ? pcs.templateMappingBinPcs[pcs!.iPivot] : -1
    if (indexNameRoot in ChordName.INDEX_SHARP_FLAT) {
      // select # or b.
      // If pitch p exists in mapping, do not select p#, but flatted (p+1)
      if (pcs.templateMappingBinPcs.includes(indexNameRoot)) {
        nameRoot = ChordName.NOTE_NAMES_FLAT[indexNameRoot]
      } else {
        nameRoot = ChordName.NOTE_NAMES_SHARP[indexNameRoot]
      }
    } else if (indexNameRoot >= 0) {
      nameRoot = ChordName.NOTE_NAMES_FLAT[indexNameRoot] // or NOTE_NAMES_SHARP what does it matter
    }

    return nameRoot + chordName.trim()
  }
}
