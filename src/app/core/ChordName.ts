import {IPcs} from "./IPcs";

const chordName : Map<string, string> = new Map<string, string>()
chordName.set('[0,3,7]', 'Minor triad')
chordName.set('[0,4,7]', 'Major triad')
chordName.set('[0,3,6]', 'Min Diminished triad')
chordName.set('[0,4,6]', 'Maj Diminished triad')
chordName.set('[0,3,8]', 'Min Augmented triad')
chordName.set('[0,4,8]', 'Maj Augmented triad')

export class ChordName {

  /**
   * Get chord name from cyclic primeform of mapped representation
   * @param pcs
   * @return {string} chord name
   */
  static getChordName(pcs : IPcs) : string {
    if (pcs.cardinal < 3) return ''
    let third = ''
    let fifth = ''
    let cardinalForm = ''
    let seven = ""

    const intervalStruct = pcs.is()// new IPcs({binPcs:pcs.getMappedBinPcs()}).is()
    switch (intervalStruct[0]) {
      case 3 : third = "Minor";
        switch (intervalStruct[1]) {
          case 3 :fifth = "Diminished"; break
          case 5 : fifth = "Augmented"; break
          case 6 : fifth = "Sixte"
        }
         break
      case 4 : third = "Major";
        switch (intervalStruct[1]) {
          case 2 :fifth = "Diminished"; break
          case 4 : fifth = "Augmented"; break
          case 5 : fifth = "Sixte"
        }
        break
    }
    if (pcs.cardinal >= 4) {
      let pivot = pcs.iPivot ?? 0
      // seven ?
      if (pcs.abinPcs[(pivot + pcs.n-1) % pcs.n] == 1) {
        // Major seven ?
        if (pcs.getMappedBinPcs()[(pcs.templateMappingBinPcs[pivot] + pcs.nMapping - 1) % pcs.nMapping] == 1) {
          seven = "M7"
        }
      }
      if (pcs.abinPcs[(pivot + pcs.n-2) % pcs.n] == 1) {
        // Minor seven ?
        if (pcs.getMappedBinPcs() [(pcs.templateMappingBinPcs[pivot] + pcs.nMapping-2) %pcs.nMapping] == 1) {
          // [pcs.nMapping-2] == 1) {
          seven = "7"
        }
      }
    }
    let chordName = `${third} ${fifth} ${seven}`

    if (chordName == 'Minor Diminished 7') {
      chordName = 'Half-Diminished 7'
    }

    return chordName
  }
}
