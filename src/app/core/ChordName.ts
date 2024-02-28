import {IPcs} from "./IPcs";

const chordName: Map<string, string> = new Map<string, string>()
chordName.set('[0,3,7]', 'Minor triad')
chordName.set('[0,4,7]', 'Major triad')
chordName.set('[0,3,6]', 'Min Diminished triad')
chordName.set('[0,4,6]', 'Maj Diminished triad')
chordName.set('[0,3,8]', 'Min Augmented triad')
chordName.set('[0,4,8]', 'Maj Augmented triad')

export class ChordName {

  static NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  static NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
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
    let seventh = ""
    let eleven = ""
    let nine = ""
    let pivot = pcs.templateMappingBinPcs[pcs.iPivot ?? 0]
    let binPcs = pcs.getMappedBinPcs()
    let n = pcs.nMapping

    if (binPcs[(pivot + 3) % n] == 1) {
      third = "min"
    }
    if (binPcs[(pivot + 4) % n] == 1) {
      if(third == "min") {
        third = ""
      } else {
        third = "Maj"
      }
    }

    if (binPcs[(pivot + 7) % n] == 0) {
      if (binPcs[(pivot + 6) % n] == 1) {
        fifth = " ♭5"
      } else if (binPcs[(pivot + 8) % n] == 1) {
        fifth = " ♯5"
      }
    }
    if (binPcs[(pivot + 9) % n] == 1) {
      sixth = "6"
    }
    if (binPcs[(pivot + 8) % n] == 1) {
      if (fifth != " ♯5") {
        sixth = " ♭6" // https://en.wikipedia.org/wiki/Sixth_chord
      }
    }
    if (binPcs[(pivot + n - 1) % n] == 1) {
      // Major seven
      seventh = "M7"
    }
    // Minor seven ?
    if (binPcs[(pivot + n - 2) % n] == 1) {
      seventh = '7'
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

    if  (seventh == "7" && third == "Maj") {
      third = '' // 7 is Major
      sixth = '' //
      nine = '' //
    }

    let _chordName = `${third}${fifth}${seventh}${sixth}${nine}${eleven}`.trim()

    if (_chordName == 'min ♭57') {
      _chordName = 'ø7' //<sub>7♭5</sub>' // 'ø7'
    } else if (_chordName == 'min ♭56' /*'minDiminished6'*/) {
      _chordName = 'o' //'dim'  // 'o ø7'
    } else if (_chordName == 'min ♭5M7') { //'minDiminishedM7') {
      _chordName = 'øM7' //'dim'  // 'o ø7'
    } else if (_chordName == 'Maj7') {
      _chordName = '7'
    } else if (_chordName == 'MajM7') {
      _chordName = 'Maj7'
    } else if (_chordName == 'Maj ♯5') {
      _chordName = 'Aug'
    } else if (_chordName == 'Maj ♯57') {
      _chordName = '7+5'  // 7#5  7+5
    } else if (_chordName == 'Maj ♯5M7') {
      _chordName = 'AugM7'
    } else if (_chordName == 'Maj ♭57') { //'MajDiminished7') {
      _chordName = '7b5'  // 7b5  7-5
    }
    if (_chordName == '♯57') {
      _chordName = '7+5'
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
      // no altered
      nameRoot = ChordName.NOTE_NAMES_FLAT[indexNameRoot] // or NOTE_NAMES_SHARP what does it matter
    }
    // console.log('nameRoot = ' + nameRoot)
    // console.log('chordName = ' + _chordName)

    if (_chordName  &&'♭♯'.indexOf(nameRoot[nameRoot.length-1]) >= 0  && '♭♯'.indexOf(_chordName[0]) >= 0)
       return  nameRoot + ' ' + _chordName
    return `${nameRoot}${_chordName}`
  }
}
