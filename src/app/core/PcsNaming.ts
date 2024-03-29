import {IPcs} from "./IPcs";

export class PcsNaming {

  static NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  static NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  static INDEX_SHARP_FLAT = [1, 3, 6, 8, 10]

  static chordsModalPF = new Map<string, string>()

  // key : is().toString(),
  // value : scale name
  // size = 2048 elements
  static scalesName = new Map<string, string>()

  static {
    // let pcs : IPcs = new IPcs({strPcs:'[0,1,3,4,5,7,8,9,11]'})
    // console.log("pcs.is().toString() = " +  pcs.is().toString())
    // PcsNaming.scalesName.set(pcs.is().toString(), 'Tcherepnin Scale')
    // https://en.wikipedia.org/wiki/Alexander_Tcherepnin
    PcsNaming.scalesName.set("1,2,1,1,2,1,1,2,1", 'Tcherepnin Scale')

    PcsNaming.scalesName.set("2,2,1,2,2,2,1", 'Major scale')
    PcsNaming.scalesName.set("2,1,2,2,2,1,2", 'Dorian mode')
    PcsNaming.scalesName.set("1,2,2,2,1,2,2", 'Phrygian mode')
    PcsNaming.scalesName.set("2,2,2,1,2,2,1", 'Lydian mode')
    PcsNaming.scalesName.set("2,2,1,2,2,1,2", 'Mixolydian mode')
    PcsNaming.scalesName.set("2,1,2,2,1,2,2", 'Aeolian mode')
    PcsNaming.scalesName.set("1,2,2,1,2,2,2", 'Locrian mode')

    PcsNaming.scalesName.set("2,2,2,2,1,2,1", 'Lydian Augmented')
    PcsNaming.scalesName.set("2,2,2,2,2,2", 'Whole tone scale')

    PcsNaming.scalesName.set("4,2,1,4,1", 'Hirajoshi scale') // 0,4,6,7,11

    PcsNaming.scalesName.set("2,2,1,2,2,1,1,1", 'Bebop dominant scale') // 0,2,4,5,7,9,10,11


    // TODO make a file from  https://en.wikipedia.org/wiki/List_of_musical_scales_and_modes
    // https://fretboardknowledge.com/guitar/kb/allan-holdsworths-10-most-usable-scales/

    // and read it here to init

  }

  static {
    // 3-chords
    PcsNaming.chordsModalPF.set('0,4,7', 'Maj')
    PcsNaming.chordsModalPF.set('0,4,6', 'Maj ♭5')
    PcsNaming.chordsModalPF.set('0,4,8', 'aug')
    PcsNaming.chordsModalPF.set('0,4,9', 'Maj6')
    PcsNaming.chordsModalPF.set('0,5,7', 'Maj sus4')
    PcsNaming.chordsModalPF.set('0,2,7', 'Maj sus2')
    PcsNaming.chordsModalPF.set('0,2,8', 'Maj ♯5 sus2')
    PcsNaming.chordsModalPF.set('0,2,6', 'Maj ♭5 sus2')
    PcsNaming.chordsModalPF.set('0,5,7', 'sus4')
    PcsNaming.chordsModalPF.set('0,3,8', 'min ♯5')
    PcsNaming.chordsModalPF.set('0,3,8,10', 'min7 ♯5')

    PcsNaming.chordsModalPF.set('0,3,7', 'min')
    PcsNaming.chordsModalPF.set('0,3,6', 'dim')

    // 4-chords
    PcsNaming.chordsModalPF.set('0,4,7,10', '7') // seventh
    PcsNaming.chordsModalPF.set('0,4,7,9', '6')
    PcsNaming.chordsModalPF.set('0,4,7,11', 'M7') // Major 7
    PcsNaming.chordsModalPF.set('0,4,8,10', '7 ♯5')
    PcsNaming.chordsModalPF.set('0,4,6,10', '7 ♭5')
    PcsNaming.chordsModalPF.set('0,5,7,10', '7 sus4') // seventh
    PcsNaming.chordsModalPF.set('0,4,8,11', 'augM7')
    PcsNaming.chordsModalPF.set('0,2,7,10', '7 sus2')
    PcsNaming.chordsModalPF.set('0,2,6,10', '7 ♭5 sus2')
    PcsNaming.chordsModalPF.set('0,2,8,10', '7 ♯5 sus2')

    PcsNaming.chordsModalPF.set('0,3,7,10', 'min7')
    PcsNaming.chordsModalPF.set('0,3,7,11', 'min M7')
    PcsNaming.chordsModalPF.set('0,3,7,9', 'min6')
    PcsNaming.chordsModalPF.set('0,3,6,10', 'ø')
    PcsNaming.chordsModalPF.set('0,3,6,9', 'o')

    // PcsNaming.chordsModalPF.set('0,1,3,4,5,7,8,9,11', 'Tcherepnin Scale')

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
        for (let j = n + pivot - 1; j > pivot + minorMajor; j--) {
          if (binPcs[j % n] == 1) {
            // 3Chord
            let testKey = key + ',' + (j - pivot)
            if (nPitches == 3) {
              if (PcsNaming.chordsModalPF.has(testKey)) {
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
                  if (PcsNaming.chordsModalPF.has(testKey2)) {
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
                if (PcsNaming.chordsModalPF.has(testKey)) {
                  res.push(testKey)
                }
              } else { // 4Chord
                if (binPcs[(pivot + 10) % n] == 1) {
                  let testKey2 = testKey + ',10'
                  if (PcsNaming.chordsModalPF.has(testKey2)) {
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
        PcsNaming.chordsModalPF.get(s1)!.length - PcsNaming.chordsModalPF.get(s2)!.length)
    }
    return res
  }

  /**
   * Get scale name of pcs (mode or scale - or chordName ?)
   * if get immediately a name, return this name
   * else if get a name after modulation, return as degree of that name
   * else pass to previous degree
   * if no more degree, return empty string
   * @param pcs
   */
  static getScaleName(pcs: IPcs): string {
    let cardinal = pcs.cardinal
    let name = ''
    for (let i = 0; i < cardinal ; i++) {
      name = PcsNaming.scalesName.get(pcs.is().toString()) ?? ''
      if (name && i==0) return name
      if (name) return `degree ${i+1} of ${name}`
      pcs = pcs.modulation(IPcs.PREV_DEGREE)
    }
    return name
  }

  /**
   * Get chord name 4 pitches first then 3 pitches
   * @param pcs
   */
  static getChordName(pcs: IPcs): string {
    const chords3pitches = PcsNaming.getKeysChord(pcs, 3)
    const chords4pitches = PcsNaming.getKeysChord(pcs, 4)

    const _chordName: string = PcsNaming.chordsModalPF.get(chords4pitches[0])
      ?? PcsNaming.chordsModalPF.get(chords3pitches[0])
      ?? ''

    if (!_chordName) return ''

    let nameRoot = ''
    const indexNameRoot = pcs.iPivot != undefined ? pcs.templateMappingBinPcs[pcs!.iPivot] : -1
    if (indexNameRoot in PcsNaming.INDEX_SHARP_FLAT) {
      // select # or b.
      // If pitch p exists in mapping, do not select p#, but flatted (p+1)
      if (pcs.templateMappingBinPcs.includes(indexNameRoot)) {
        nameRoot = PcsNaming.NOTE_NAMES_FLAT[indexNameRoot]
      } else {
        nameRoot = PcsNaming.NOTE_NAMES_SHARP[indexNameRoot]
      }
    } else if (indexNameRoot >= 0) {
      // no altered
      nameRoot = PcsNaming.NOTE_NAMES_FLAT[indexNameRoot] // or NOTE_NAMES_SHARP what does it matter
    }
    // console.log('nameRoot = ' + nameRoot)
    // console.log('chordName = ' + _chordName)

    if (_chordName && '♭♯'.indexOf(nameRoot[nameRoot.length - 1]) >= 0 && '♭♯'.indexOf(_chordName[0]) >= 0)
      return nameRoot + ' ' + _chordName
    return `${nameRoot}${_chordName}`
  }




}

