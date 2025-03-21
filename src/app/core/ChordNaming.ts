import {IPcs} from "./IPcs";
import {ScoreDrawingAbcNotation} from "../ui/ScoreDrawingAbcNotation";

interface IChordNameOrder {
  name: string   // name of chord
  sortOrder: number  // sortOrder use by sort list of chords (min = prior)
  root: number  // not used (intended for chord inversion)
}

export class ChordNaming {

  static NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  static NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  static INDEX_ALTERED_NOTES = [1, 3, 6, 8, 10]

  /**
   * List of chordNames : key = 'pcs primeForm as string', value = IChordNameOrder
   *
   *  List of "current" chords with their sortOrder (use for sort list of chords)
   *  IMPORTANT : Add, update or remove elements of this list is
   *  the only operation to have chord recognized, or not.
   *
   */
  static chordsModalPF = new Map<string, IChordNameOrder[]>([
    ///// 3-chords
    // Major
    ['0 4 7', [{name: 'Maj', sortOrder: 1, root: 0}]],
    ['0 4 10', [{name: '7', sortOrder: 5, root: 0}]],
    ['0 4 6', [{name: 'Maj ♭5', sortOrder: 15, root: 0}]],
    ['0 4 8', [{name: 'aug', sortOrder: 13, root: 0}]],
    ['0 4 9', [{name: 'Maj6', sortOrder: 3, root: 0}, {name: 'm/3rd', sortOrder: 6, root: 9}]],
    ['0 5 7', [{name: 'sus4', sortOrder: 9, root: 0}]],
    ['0 2 7', [{name: 'sus2', sortOrder: 8, root: 0}]],
    ['0 2 8', [{name: '♯5 sus2', sortOrder: 21, root: 0}]],
    ['0 2 6', [{name: '♭5 sus2', sortOrder: 20, root: 0}]],
    // minor
    ['0 3 7', [{name: 'm', sortOrder: 2, root: 0}]],
    ['0 3 6', [{name: 'dim', sortOrder: 3, root: 0}]],
    ['0 3 8', [{name: 'm ♭6', sortOrder: 6, root: 0}, {name: 'Maj/3rd', sortOrder: 6, root: 8}]],

    // (experimental) inversion
    ['0 5 9', [{name: 'Maj/5th', sortOrder: 6, root: 5}]],
    ['0 5 8', [{name: 'm/5th', sortOrder: 6, root: 5}]],
    // => let chord third bass inversion are sixth chord considered ??

    ///// 4-chords
    // Major
    ['0 4 7 9', [{name: '6', sortOrder: 5, root: 0}, {name: 'm/3rd', sortOrder: 6, root: 9}]],
    ['0 4 7 11', [{name: 'M7', sortOrder: 4, root: 0}]],

    ['0 4 7 8', [{name: 'Maj ♭6', sortOrder: 6, root: 0}]],

    // Seventh
    ['0 4 7 10', [{name: '7', sortOrder: 5, root: 0}]],
    ['0 4 8 10', [{name: '7 ♯5', sortOrder: 8, root: 0}]],
    ['0 4 6 10', [{name: '7 ♭5', sortOrder: 6, root: 0}]],
    ['0 5 7 10', [{name: '7 sus4', sortOrder: 15, root: 0}]],
    ['0 5 7 11', [{name: 'sus4 M7', sortOrder: 15, root: 0}]],
    ['0 4 8 11', [{name: 'aug M7', sortOrder: 5, root: 0}]],
    ['0 2 7 10', [{name: '7 sus2', sortOrder: 7, root: 0}]],
    ['0 2 6 10', [{name: '7 ♭5 sus2', sortOrder: 22, root: 0}]],
    ['0 2 8 10', [{name: '7 ♯5 sus2', sortOrder: 23, root: 0}]],
    ['0 2 5 10', [{name: '9sus2', sortOrder: 10, root: 0}]], // no fifth

    // minor
    ['0 3 7 10', [{name: 'm7', sortOrder: 2, root: 0}]],
    ['0 3 7 11', [{name: 'm M7', sortOrder: 6, root: 0}]],
    ['0 3 8 10', [{name: 'm7 ♯5', sortOrder: 8, root: 0}]],
    ['0 3 7 9', [{name: 'm6', sortOrder: 5, root: 0}]],
    ['0 3 7 8', [{name: 'm ♭6', sortOrder: 7, root: 0}, {name: 'M7/3rd', sortOrder: 7, root: 8}]],

    // chord without name, but inversion
    ['0 4 5 9', [{name: 'M7/5th', sortOrder: 7, root: 5}]],
    ['0 1 5 8', [{name: 'M7/7th', sortOrder: 7, root: 1}]],
    // end

    ['0 3 6 10', [{name: 'ø', sortOrder: 3, root: 0}]],
    ['0 3 6 9', [{name: 'dim7', sortOrder: 3, root: 0}]],

  ])

  /**
   * From pcs, get list of possible currents chords
   * @param pcs
   * @param nPitches 3 or 4 (3 or 4 pitches chords) to obtain
   * @param includeInversion where .root > 0
   * @return string[] list of pcs in string representation as '0 3 6 9' (cardinal = nPitches)
   */
  static getKeysChord(pcs: IPcs, nPitches: number, includeInversion: boolean = true): string[] {
    let chordPcsList: string[] = []

    if (pcs.cardinal < 3) return chordPcsList

    // experimentation
    if (pcs.cardinal === nPitches) {
      let pcsPF = pcs
      const pivot = pcsPF.getMappedPivot() ?? 0
      // translate where pivot = 0, for make a key
      pcsPF = pcs.transposition(-pivot)
      const keyChord = pcsPF.getMappedPcsStr(false)
      if (ChordNaming.chordsModalPF.get(keyChord)) {
        if (ChordNaming.chordsModalPF.get(keyChord)![0].root === 0
          || ChordNaming.chordsModalPF.get(keyChord)![0].root > 0
          && includeInversion) {
            chordPcsList.push(keyChord)
        }
      }
      // max one name
      return chordPcsList
    }

    // assert nMapping to be 12
    let pivot = pcs.getMappedPivot()
    let binPcs = pcs.getMappedVectorPcs()
    let n = pcs.nMapping // 12 expected

    let key = ''
    for (let minorMajor of [3, 4]) {
      if (binPcs[(pivot + minorMajor) % n] == 1) {
        key = '0 ' + minorMajor
        for (let j = n + pivot - 1; j > pivot + minorMajor; j--) {
          if (binPcs[j % n] == 1) {
            // 3Chord
            let testKey = key + ' ' + (j - pivot)
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
                  let testKey2 = testKey + ' ' + ((k - pivot) % n)
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
          key = '0 ' + sus
          for (const fifth of [5, 6, 7, 8]) {
            if (binPcs[(pivot + fifth) % n] == 1) {
              let testKey = key + ' ' + fifth
              if (nPitches == 3) {
                if (ChordNaming.chordsModalPF.has(testKey)) {
                  chordPcsList.push(testKey)
                }
              } else { // 4Chord
                if (binPcs[(pivot + 10) % n] == 1) {
                  let testKey2 = testKey + ' 10'
                  if (ChordNaming.chordsModalPF.has(testKey2)) {
                    // 7 sus
                    chordPcsList.push(testKey2)
                  }
                }
                if (binPcs[(pivot + 11) % n] == 1) {
                  let testKey2 = testKey + ' 11'
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

    if (chordPcsList.length > 1) {
      chordPcsList.sort((s1, s2) => {
        const orderChord1 = ChordNaming.chordsModalPF.get(s1)![0].sortOrder ?? 42  // normally sortOrder is set
        const orderChord2 = ChordNaming.chordsModalPF.get(s2)![0].sortOrder ?? 42  // idem
        return orderChord1 - orderChord2
      })
    }
    return chordPcsList
  }

  /**
   * Get chord name 4 pitches first then 3 pitches if exists else empty string
   * Root chord is given by iPivot
   * @param pcs assert pcs.n == 12
   *    The caller will have to check before calling this function, and possibly call unMap() before
   * @param nbPitches value of k (kChord)
   */
  static getFirstChordName(pcs: IPcs, nbPitches: number = 3): string {
    let chordsNPitches: string[] = []
    if (nbPitches >= 3 && nbPitches <= 4) {
      chordsNPitches = ChordNaming.getKeysChord(pcs, nbPitches)
    }

    let nameRoot = ''
    const names = ChordNaming.chordsModalPF.get(chordsNPitches[0])

    // experimental
    if (!names) return ''

    let theChordName = ''

    for (const chordName of names) {
      const _chordName = chordName.name
      // which nameRoot name ?
      let indexNameRoot = ( (pcs.iPivot ?? 0) + chordName.root) % 12 // case chord inversion

      // console.log("indexNameRoot = ", indexNameRoot)
      if (ChordNaming.INDEX_ALTERED_NOTES.includes(indexNameRoot)) {
        // select # or b.
        // ref cycle of fifths
        // https://fr.wikipedia.org/wiki/Cycle_des_quintes#/media/Fichier:Circle_of_fifths_deluxe_4_french.svg
        if (indexNameRoot > 6) {
          // FLAT_NAME
          nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot]
          // exception when chord
          if ([3, 4].includes(pcs.cardinal)) {
            // based on score notation for set name root
            if (!ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs).substring(0, 2).includes(nameRoot[0])) {
              nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
            }
          }
        } else {
          // SHARP_NAME
          nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
          // exception when chord
          if ([3, 4].includes(pcs.cardinal)) {
            // based on score notation for set name root
            if (!ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs).substring(0, 2).includes(nameRoot[0])) {
              nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot]
            }
          }
        }
      } else if (indexNameRoot >= 0) {
        // no altered
        nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot] // or NOTE_NAMES_FLAT what does it matter
      }
      // add new name tp theChordName (some pcs have more than one name)
      theChordName = theChordName
        ? `${theChordName} ~ ${nameRoot}${_chordName}`
        : `${nameRoot}${_chordName}`
    }
    return theChordName
  }

}
