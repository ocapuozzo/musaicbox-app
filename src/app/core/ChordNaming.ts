import {IPcs} from "./IPcs";
import {ScoreDrawingAbcNotation} from "../ui/ScoreDrawingAbcNotation";

interface IChordNameOrder {
  name : string   // name of chord
  order : number  // order use by sort list of chords
}

export class ChordNaming {

  static NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  static NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  static INDEX_ALTERED_NOTES = [1, 3, 6, 8, 10]

  /**
   * List of chordNames : key = 'pcs primeForm as string', value = IChordNameOrder
   */
  static chordsModalPF = new Map<string, IChordNameOrder>()

  /**
   * A list of "current" chords with their order (use for sort list of chords)
   * IMPORTANT : Add, update or remove elements of this list is
   * the only operation to have chord recognized, or not.
   */
  static {
    // 3-chords
    ChordNaming.chordsModalPF.set('0,4,7', {name:'Maj', order:1})
    ChordNaming.chordsModalPF.set('0,4,10', {name:'7', order:5})
    ChordNaming.chordsModalPF.set('0,4,6', {name:'Maj ♭5', order:15})
    ChordNaming.chordsModalPF.set('0,4,8', {name:'aug', order:13})
    ChordNaming.chordsModalPF.set('0,4,9', {name:'Maj6', order:3})
    ChordNaming.chordsModalPF.set('0,5,7', {name:'sus4', order: 9})
    ChordNaming.chordsModalPF.set('0,2,7', {name:'sus2', order: 8})
    ChordNaming.chordsModalPF.set('0,2,8', {name:'♯5 sus2', order:21})
    ChordNaming.chordsModalPF.set('0,2,6', {name:'♭5 sus2', order:20})
    // ChordNaming.chordsModalPF.set('0,5,7', 'sus4')

    ChordNaming.chordsModalPF.set('0,3,8', {name:'m ♯5', order:6})
    ChordNaming.chordsModalPF.set('0,3,7', {name:'m', order:2})
    ChordNaming.chordsModalPF.set('0,3,6', {name:'dim', order:3})

    // 4-chords
    ChordNaming.chordsModalPF.set('0,4,7,10', {name:'7', order:5}) // seventh
    ChordNaming.chordsModalPF.set('0,4,7,9', {name:'6', order:5})
    ChordNaming.chordsModalPF.set('0,4,7,11', {name:'M7', order:4}) // Major 7
    ChordNaming.chordsModalPF.set('0,4,7,8', {name:'M♭6', order:6}) //

    ChordNaming.chordsModalPF.set('0,4,8,10', {name:'7 ♯5', order:8})
    ChordNaming.chordsModalPF.set('0,4,6,10', {name:'7 ♭5', order:6})
    ChordNaming.chordsModalPF.set('0,5,7,10', {name:'7 sus4', order:15}) // seventh
    ChordNaming.chordsModalPF.set('0,5,7,11', {name:'sus4 M7', order:15})
    ChordNaming.chordsModalPF.set('0,4,8,11', {name:'aug M7', order:5})
    ChordNaming.chordsModalPF.set('0,2,7,10', {name:'7 sus2', order:7})
    ChordNaming.chordsModalPF.set('0,2,6,10', {name:'7 ♭5 sus2', order:22})
    ChordNaming.chordsModalPF.set('0,2,8,10', {name:'7 ♯5 sus2', order:23})
    ChordNaming.chordsModalPF.set('0,2,5,10', {name:'9sus2', order:10}) // no fifth

    ChordNaming.chordsModalPF.set('0,3,7,10', {name:'m7', order:2})
    ChordNaming.chordsModalPF.set('0,3,7,11', {name:'m M7', order:6})
    ChordNaming.chordsModalPF.set('0,3,8,10', {name:'m7 ♯5', order:8})
    ChordNaming.chordsModalPF.set('0,3,7,9', {name:'m6', order:5})
    ChordNaming.chordsModalPF.set('0,3,7,8', {name:'m ♭6', order:7})
    ChordNaming.chordsModalPF.set('0,3,6,10', {name:'ø', order:3})
    ChordNaming.chordsModalPF.set('0,3,6,9', {name:'dim7', order:3})

  }

  /**
   * From pcs, get list of possible currents chords
   * @param pcs
   * @param nPitches 3 or 4 (3 or 4 pitches chords) to obtain
   * @return string[] list of pcs in string representation (cardinal nPitches)
   */
  static getKeysChord(pcs: IPcs, nPitches: number): string[] {
    let chordPcsList: string[] = []

    if (pcs.cardinal < 3) return chordPcsList

    let pivot = pcs.getMappedPivot()
    let binPcs = pcs.getMappedBinPcs()
    let n = pcs.nMapping // 12 waiting

    let key = ''
    for (let minorMajor of [3, 4]) {
      if (binPcs[(pivot + minorMajor) % n] == 1) {
        key = '0,' + minorMajor
        for (let j = n + pivot - 1; j > pivot + minorMajor; j--) {
          if (binPcs[j % n] == 1) {
            // 3Chord
            let testKey = key + ',' + (j - pivot)
            if (nPitches == 3) {
              if (ChordNaming.chordsModalPF.has(testKey)) {
                chordPcsList.push(testKey)
              }
            } else { // nPitches == 4
              // form end, seventh first before sixth
              let iStart = j + 1
              let iEnd = n + pivot + 1
              for (let k = iEnd; k >= iStart; k--) {
                if (binPcs[k % n] == 1) {
                  // 4Chord
                  let testKey2 = testKey + ',' + ((k - pivot) % n)
                  if (ChordNaming.chordsModalPF.has(testKey2)) {
                    chordPcsList.push(testKey2)
                  }
                }
              }
            }
          }
        }
      }
    }
    // no third
    if ((binPcs[(pivot + 3) % n] == 0) && (binPcs[(pivot + 4) % n] == 0)) {
      for (let sus of [2, 5]) {
        if (binPcs[(pivot + sus) % n] == 1) {
          // sus2 sus4 ?
          key = '0,' + sus
          for (const fifth of [5, 6, 7, 8]) {
            if (binPcs[(pivot + fifth) % n] == 1) {
              let testKey = key + ',' + fifth
              if (nPitches == 3) {
                if (ChordNaming.chordsModalPF.has(testKey)) {
                  chordPcsList.push(testKey)
                }
              } else { // 4Chord
                if (binPcs[(pivot + 10) % n] == 1) {
                  let testKey2 = testKey + ',10'
                  if (ChordNaming.chordsModalPF.has(testKey2)) {
                    // 7 sus
                    chordPcsList.push(testKey2)
                  }
                }
                if (binPcs[(pivot + 11) % n] == 1) {
                  let testKey2 = testKey + ',11'
                  if (ChordNaming.chordsModalPF.has(testKey2)) {
                    // sus2 or sus4 M7
                    chordPcsList.push(testKey2)
                  }
                }
              }
            }
          }
        }
      }
    }

    chordPcsList.sort((s1, s2) => {
      const orderChord1 = ChordNaming.chordsModalPF.get(s1)?.order ?? 42  // normally order is set
      const orderChord2 = ChordNaming.chordsModalPF.get(s2)?.order ?? 42  // idem
      return orderChord1 - orderChord2
    })

    return chordPcsList
  }

  /**
   * Get chord name 4 pitches first then 3 pitches if exists else empty string
   * Root chord is given by iPivot
   * @param pcs
   * @param nbPitches value of k (kChord)
   */
  static getFirstChordName(pcs: IPcs, nbPitches : number = 3): string {
    let chordsNPitches : string[] = []
    if (nbPitches >= 3 && nbPitches <= 4 ) {
      chordsNPitches = ChordNaming.getKeysChord(pcs, nbPitches)
    }
    // const chords3pitches = ChordNaming.getKeysChord(pcs, 3)
    // const chords4pitches = ChordNaming.getKeysChord(pcs, 4)

    // const _chordName: string = ChordNaming.chordsModalPF.get(chords4pitches[0])
    //   ?? ChordNaming.chordsModalPF.get(chords3pitches[0])
    //   ?? ''
    const _chordName = chordsNPitches.length > 0 ? ChordNaming.chordsModalPF.get(chordsNPitches[0])?.name : undefined

    if (_chordName === undefined) return ''

    let nameRoot = ''
    const indexNameRoot = pcs.iPivot != undefined ? pcs.getMappedPivot() : -1
    // console.log("indexNameRoot = ", indexNameRoot)
    if (ChordNaming.INDEX_ALTERED_NOTES.includes(indexNameRoot)) {
      // select # or b.
      // // If pitch p exists in mapping, do not select p#, but flatted (p+1) -- hum, why ?
      // if (pcs.templateMappingBinPcs.includes(indexNameRoot)) {
      //   nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot]
      // } else {
      //   nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
      // }

      // ref cycle of fifths
      // https://fr.wikipedia.org/wiki/Cycle_des_quintes#/media/Fichier:Circle_of_fifths_deluxe_4_french.svg
      if (indexNameRoot > 6 ) {
        nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot]
        // exception when chord
        if ([3,4].includes(pcs.cardinal)) {
          // based on score notation for set name root
          if (!ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs).substring(0,2).includes(nameRoot[0])) {
            nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
          }
        }
      } else {
        nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
        // exception when chord
        if ([3,4].includes(pcs.cardinal)) {
          // based on score notation for set name root
          if (!ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs).substring(0,2).includes(nameRoot[0])) {
            nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot]
          }
        }
      }
    } else if (indexNameRoot >= 0) {
      // no altered
      nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot] // or NOTE_NAMES_FLAT what does it matter
    }
    // console.log('nameRoot = ' + nameRoot)
    // console.log('chordName = ' + _chordName)

    if (_chordName && '♭♯'.indexOf(nameRoot[nameRoot.length - 1]) >= 0 && '♭♯'.indexOf(_chordName[0]) >= 0)
      return nameRoot + ' ' + _chordName
    return `${nameRoot}${_chordName}`
  }

}
