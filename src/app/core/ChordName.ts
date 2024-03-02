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


  static chord3pitches = new Map<string, string>()
  static chord4pitches = new Map<string, string>()

  static {
    // 3-chords
    ChordName.chord3pitches.set('0,4,7', 'Maj')
    ChordName.chord3pitches.set('0,4,6', 'Maj ♭5')
    ChordName.chord3pitches.set('0,4,8', 'aug')
    ChordName.chord3pitches.set('0,4,9', 'Maj6')
    ChordName.chord3pitches.set('0,5,7', 'Maj sus4')
    ChordName.chord3pitches.set('0,2,7', 'Maj sus2')
    ChordName.chord3pitches.set('0,2,8', 'Maj ♯5 sus2')
    ChordName.chord3pitches.set('0,2,6', 'Maj ♭5 sus2')
    ChordName.chord3pitches.set('0,5,7', 'sus4')
    ChordName.chord3pitches.set('0,3,7', 'min')
    ChordName.chord3pitches.set('0,3,6', 'dim')


    // 4-chords
    ChordName.chord4pitches.set('0,4,7,10', '7') // seventh
    ChordName.chord4pitches.set('0,4,7,9', '6')
    ChordName.chord4pitches.set('0,4,7,11', 'M7') // Major 7
    ChordName.chord4pitches.set('0,4,8,10', '7 ♯5')
    ChordName.chord4pitches.set('0,4,6,10', '7 ♭5')
    ChordName.chord4pitches.set('0,5,7,10', '7 sus4') // seventh
    ChordName.chord4pitches.set('0,4,8,11', 'augM7')
    ChordName.chord4pitches.set('0,2,7,10', '7 sus2')
    ChordName.chord4pitches.set('0,2,6,10', '7 ♭5 sus2')
    ChordName.chord4pitches.set('0,2,8,10', '7 ♯5 sus2')

    ChordName.chord4pitches.set('0,3,7,10', 'min7')
    ChordName.chord4pitches.set('0,3,7,11', 'min M7')
    ChordName.chord4pitches.set('0,3,7,9', 'min6')
    ChordName.chord4pitches.set('0,3,6,10', 'ø')
    ChordName.chord4pitches.set('0,3,6,9', 'o')
  }


  static getKeysChord(pcs: IPcs, nPitches: number): string[] {
    let res: string[] = []

    if (pcs.cardinal < 3) return res

    let pivot = pcs.templateMappingBinPcs[pcs.iPivot ?? 0]
    let binPcs = pcs.getMappedBinPcs()
    let n = pcs.nMapping

    let key = ''
    for (let minorMajor of [3, 4]) {
      if (binPcs[(pivot + minorMajor) % n] == 1) {
        key = '0,' + minorMajor
        // for (let j = pivot + minorMajor + 1; j < (n + pivot); j++) {
        // seventh first
        for (let j = n + pivot - 1; j > pivot + minorMajor; j--) {
          if (binPcs[j % n] == 1) {
            // 3Chord
            let testKey = key + ',' + (j - pivot)
            if (nPitches == 3) {
              if (ChordName.chord3pitches.has(testKey)) {
                res.push(testKey)
              }
            } else { // nPitches == 4
              // form end, seventh first before sixth
              let iStart = j + 1
              let iEnd = n + pivot + 1
              for (let k = iEnd; k >= iStart; k--) {
                if (binPcs[k % n] == 1) {
                  // 4Chord
                  let testKey2 = testKey + ',' + ((k - pivot) % n)
                  if (ChordName.chord4pitches.has(testKey2)) {
                    res.push(testKey2)
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
                if (ChordName.chord3pitches.has(testKey)) {
                  res.push(testKey)
                }
              } else { // 4Chord
                if (binPcs[(pivot + 10) % n] == 1) {
                  let testKey2 = testKey + ',10'
                  if (ChordName.chord4pitches.has(testKey2)) {
                    // 7 sus2 or 7 sus4
                    res.push(testKey2)
                  }
                }
              }
            }
          }
        }
      }
    }
    if (nPitches == 3) {
      // chord name small in first
      res.sort((s1, s2) =>
        ChordName.chord3pitches.get(s1)!.length - ChordName.chord3pitches.get(s2)!.length)
    }
    return res
  }

  static _getKeysChord(pcs: IPcs, nPitches: number): string[] {
    let res: string[] = []

    if (pcs.cardinal < 3) return res

    let pivot = pcs.templateMappingBinPcs[pcs.iPivot ?? 0]
    let binPcs = pcs.getMappedBinPcs()
    let n = pcs.nMapping

    // start pivot
    let i = pivot;
    let key = ''
    if (binPcs[(i + 3) % n] == 1) {
      key += '0,3'
      for (let j = i + 4; j < (n + pivot); j++) {
        if (binPcs[j % n] == 1) {
          // 3Chord
          let testKey = key + ',' + (j - i)
          if (nPitches == 3 && ChordName.chord3pitches.has(testKey)
            || nPitches == 4) {
            if (nPitches == 3) {
              res.push(testKey)
            } else {
              // form end, seventh first before sixth
              for (let k = n + pivot + 1; k >= j + 1; k--) {
                if (binPcs[k % n] == 1) {
                  // 4Chord
                  let testKey2 = testKey + ',' + (k - i)
                  if (ChordName.chord4pitches.has(testKey2)) {
                    res.push(testKey2)
                  }
                }
              }
            }
          }
        }
      }
    }
    if (binPcs[(i + 4) % n] == 1) {
      key = '0,4'
      for (let j = i + 5; j < (n + pivot); j++) {
        if (binPcs[j % n] == 1) {
          // 3Chord
          let testKey = key + ',' + (j - i)
          if (nPitches == 3 && ChordName.chord3pitches.has(testKey)
            || nPitches == 4) {
            if (nPitches == 3) {
              res.push(testKey)
            } else {
              // form end, seventh first before sixth
              for (let k = n + pivot + 1; k >= j + 1; k--) {
                if (binPcs[k % n] == 1) {
                  // 4Chord
                  let testKey2 = testKey + ',' + (k - i)
                  if (ChordName.chord4pitches.has(testKey2)) {
                    res.push(testKey2)
                  }
                }
              }
            }
          }
        }
      }
    }
    return res
  }


  static getChordName(pcs: IPcs): string {
    const chords3pitches = ChordName.getKeysChord(pcs, 3)
    const chords4pitches = ChordName.getKeysChord(pcs, 4)

    const _chordName: string = ChordName.chord4pitches.get(chords4pitches[0])
      ?? ChordName.chord3pitches.get(chords3pitches[0])
      ?? ''

    if (!_chordName) return ''

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

    if (_chordName && '♭♯'.indexOf(nameRoot[nameRoot.length - 1]) >= 0 && '♭♯'.indexOf(_chordName[0]) >= 0)
      return nameRoot + ' ' + _chordName
    return `${nameRoot}${_chordName}`
  }
}

