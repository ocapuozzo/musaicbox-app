import {IPcs} from "./IPcs";

export class ChordNaming {

  static NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  static NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  static INDEX_SHARP_FLAT = [1, 3, 6, 8, 10]

  /**
   * List of chordNames : key = 'modalPrimeForm as string', value = chord name
   */
  static chordsModalPF = new Map<string, string>()

  /**
   * A list of "current" chords.
   * Chords are identify from this list.
   * Add or remove elements of this list is the only operation to have chord recognized, or not.
   */
  static {
    // 3-chords
    ChordNaming.chordsModalPF.set('0,4,7', 'Maj')
    ChordNaming.chordsModalPF.set('0,4,6', 'Maj ♭5')
    ChordNaming.chordsModalPF.set('0,4,8', 'aug')
    ChordNaming.chordsModalPF.set('0,4,9', 'Maj6')
    ChordNaming.chordsModalPF.set('0,5,7', 'Maj sus4')
    ChordNaming.chordsModalPF.set('0,2,7', 'Maj sus2')
    ChordNaming.chordsModalPF.set('0,2,8', 'Maj ♯5 sus2')
    ChordNaming.chordsModalPF.set('0,2,6', 'Maj ♭5 sus2')
    // ChordNaming.chordsModalPF.set('0,5,7', 'sus4')

    ChordNaming.chordsModalPF.set('0,3,8', 'min ♯5')
    ChordNaming.chordsModalPF.set('0,3,7', 'min')
    ChordNaming.chordsModalPF.set('0,3,6', 'dim')

    // 4-chords
    ChordNaming.chordsModalPF.set('0,4,7,10', '7') // seventh
    ChordNaming.chordsModalPF.set('0,4,7,9', '6')
    ChordNaming.chordsModalPF.set('0,4,7,11', 'M7') // Major 7
    ChordNaming.chordsModalPF.set('0,4,7,8', 'M♭6') //

    ChordNaming.chordsModalPF.set('0,4,8,10', '7 ♯5')
    ChordNaming.chordsModalPF.set('0,4,6,10', '7 ♭5')
    ChordNaming.chordsModalPF.set('0,5,7,10', '7 sus4') // seventh
    ChordNaming.chordsModalPF.set('0,4,8,11', 'augM7')
    ChordNaming.chordsModalPF.set('0,2,7,10', '7 sus2')
    ChordNaming.chordsModalPF.set('0,2,6,10', '7 ♭5 sus2')
    ChordNaming.chordsModalPF.set('0,2,8,10', '7 ♯5 sus2')

    ChordNaming.chordsModalPF.set('0,3,7,10', 'min7')
    ChordNaming.chordsModalPF.set('0,3,7,11', 'min M7')
    ChordNaming.chordsModalPF.set('0,3,8,10', 'min7 ♯5')
    ChordNaming.chordsModalPF.set('0,3,7,9', 'min6')
    ChordNaming.chordsModalPF.set('0,3,7,8', 'min ♭6')
    ChordNaming.chordsModalPF.set('0,3,6,10', 'ø')
    ChordNaming.chordsModalPF.set('0,3,6,9', 'dim7')

  }

  /**
   * From pcs, get list of possible currents chords
   * @param pcs
   * @param nPitches 3 or 4 (3 or 4 pitches chords) to obtain
   * @return string[] list of pcs in string representation (cardinal 3 or 4)
   */
  static getKeysChord(pcs: IPcs, nPitches: number): string[] {
    let chordPcsList: string[] = []

    if (pcs.cardinal < 3) return chordPcsList

    let pivot = pcs.templateMappingBinPcs[pcs.iPivot ?? 0]
    let binPcs = pcs.getMappedBinPcs()
    let n = pcs.nMapping

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
          for (const fifth of [6, 7, 8]) {
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
                    // 7 sus2 or 7 sus4
                    chordPcsList.push(testKey2)
                  }
                }
              }
            }
          }
        }
      }
    }
    // put "altered" chords after others
    chordPcsList.sort((s1, s2) => {
      const chord1 = ChordNaming.chordsModalPF.get(s1) ?? ''
      const chord2 = ChordNaming.chordsModalPF.get(s2) ?? ''
      return (chord1.indexOf("♯") + chord1.indexOf("♭") + chord1.indexOf("sus") + chord1.indexOf("6"))
        -
        (chord2.indexOf("♯") + chord2.indexOf("♭") + chord2.indexOf("sus") + chord2.indexOf("6"))
    })
    return chordPcsList
  }

  /**
   * Get chord name 4 pitches first then 3 pitches if exists else empty string
   * Root chord is given by iPivot
   * @param pcs
   */
  static getChordName(pcs: IPcs): string {
    const chords3pitches = ChordNaming.getKeysChord(pcs, 3)
    const chords4pitches = ChordNaming.getKeysChord(pcs, 4)

    const _chordName: string = ChordNaming.chordsModalPF.get(chords4pitches[0])
      ?? ChordNaming.chordsModalPF.get(chords3pitches[0])
      ?? ''

    if (!_chordName) return ''

    let nameRoot = ''
    const indexNameRoot = pcs.iPivot != undefined ? pcs.templateMappingBinPcs[pcs!.iPivot] : -1
    if (indexNameRoot in ChordNaming.INDEX_SHARP_FLAT) {
      // select # or b.
      // If pitch p exists in mapping, do not select p#, but flatted (p+1)
      if (pcs.templateMappingBinPcs.includes(indexNameRoot)) {
        nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot]
      } else {
        nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
      }
    } else if (indexNameRoot >= 0) {
      // no altered
      nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot] // or NOTE_NAMES_SHARP what does it matter
    }
    // console.log('nameRoot = ' + nameRoot)
    // console.log('chordName = ' + _chordName)

    if (_chordName && '♭♯'.indexOf(nameRoot[nameRoot.length - 1]) >= 0 && '♭♯'.indexOf(_chordName[0]) >= 0)
      return nameRoot + ' ' + _chordName
    return `${nameRoot}${_chordName}`
  }

}
