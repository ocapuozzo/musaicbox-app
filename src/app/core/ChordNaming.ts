import {IPcs} from "./IPcs";
import {ScoreDrawingAbcNotation} from "../ui/ScoreDrawingAbcNotation";

interface IChordNameOrder {
  name: string   // name of chord
  cardinal: number,
  sortOrder: number  // sortOrder use by sort list of chords (min = prior)
  root: number  // for chord inversion
}

export class ChordNaming {

  static NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  static NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  static INDEX_ALTERED_NOTES = [1, 3, 6, 8, 10]
  static inversionSuffix : string[] = [
    "", "2d", "2d", "3rd", "3rd", "4th", "5th", "5th", "6th", "6th", "7th", "7th"]


  /**
   * List of chordNames: key = if pcs.pid(), value = IChordNameOrder
   *
   *  List of "current" chords with their sortOrder (use for sort list of chords)
   *  IMPORTANT: Add, update or remove elements of this list is
   *  the only operation to have chord recognized, or not.
   *
   *  To determine if a chord is included in the possible chords of a PCS p,
   *  a binary AND operator (bitwise &) is applied between the pid of Chord and the pid of Pcs.
   *  If the result is the pid of chord, then pcs includes this chord.
   *  Very efficient processing (not found on the first try :) - 2025-april-2
   *  (See forEach loop in getKeysChord method)
   *
   *  refactor (2025-may-21) : Automatic search for a chord inversion when chord has not a name
   *  Be careful, when the chord has a name, as '0 4 7 9' sixth chord
   *  Automatic search does not work and the inverse chord must be written literally
   *  as the another chord name (here the second entry for "m7/3rd")
   *  Example:  [657, [{name: '6', cardinal: 4, sortOrder: 6, root: 0}, {name: 'm7/3rd', cardinal:4, sortOrder: 6, root: 9}]],
   *  Else if this is only an inverse chord as : [545, [{name: 'Maj/5th', cardinal: 3, sortOrder: 6, root: 5}]]
   *  Then DO NOT write this type of inverse chord name, il will be automatically looked up by getChordName
   *
   */
  static chordsPidKeyWithZeroAsRoot = new Map<number, IChordNameOrder[]>([
    // ///// 3-chords  ///// ///// ///// ///// ///// /////

    // '0 4 7'  Really a 3 chord ???
    [145, [{name: 'Maj', cardinal: 3, sortOrder: 3, root: 0}]],

    // '0 4 10' 7 no 5
    [1041, [{name: '7 no 5', cardinal: 3, sortOrder: 6, root: 0}]],

    // '0 4 6' Maj ♭5
    [81, [{name: 'Maj ♭5', cardinal: 3, sortOrder: 15, root: 0}]],

    // '0 4 8' aug
    [273, [{name: 'aug', cardinal: 3, sortOrder: 5, root: 0}]],

    // '0 4 9' Maj6 no 5 or minor bass 3rd
    [529, [{name: 'Maj6', cardinal: 3, sortOrder: 3, root: 0}, {name: 'm/3rd', cardinal:3, sortOrder: 6, root: 9}]],

    // '0 5 7' sus4
    [161, [{name: 'sus4', cardinal: 3, sortOrder: 9, root: 0}]],

    // '0 2 7' sus2
    [133, [{name: 'sus2', cardinal: 3, sortOrder: 8, root: 0}]],

    // '0 2 8' Maj ♭5 /3rd
    [261, [{name: 'Maj ♭5 /3rd', cardinal: 3, sortOrder: 21, root: 8}, {name: '♯5 sus2', cardinal:3, sortOrder: 22, root: 0}]],

    // '0 2 6'
    [69, [{name: '7 no 5 /7th', cardinal: 3, sortOrder: 10, root: 2}]],

    //
    // ******* minor 3chord *********************
    //

    // '0 3 7' minor
    [137, [{name: 'm', cardinal: 3, sortOrder: 2, root: 0}]],

    // '0 3 6' diminished
    [73, [{name: 'dim', cardinal: 3, sortOrder: 3, root: 0}]],

    // '0 3 8' minor ♭6 or Maj/3rd
    [265, [{name: 'm ♭6', cardinal: 3, sortOrder: 6, root: 0}, {name: 'Maj/3rd', cardinal:3, sortOrder: 6, root: 8}]],

    //
    //    history :  origin of test chord inversion - static written
    // '0 5 9' Major bass 5th
    // [545, [{name: 'Maj/5th', cardinal: 3, sortOrder: 6, root: 5}]],
    // This is no longer necessary since refactoring (2025-may-21)


    // ///// 4-chords  ///// ///// ///// ///// ///// /////

    //
    // ******* Major 4chord *********************
    //

    // '0 4 7 9' sixth chord or minor seventh bass third
    // When the chord has a name, the inverse must be written literally
    // as the chord name (here the second entry for "m7/3rd")
    // otherwise the inversion is automatically/dynamically looked up by getChordName
    [657, [{name: '6', cardinal: 4, sortOrder: 6, root: 0}, {name: 'm7/3rd', cardinal:4, sortOrder: 6, root: 9}]],

    // '0 4 7 11' Major 7
    [2193, [{name: 'M7', cardinal: 4, sortOrder: 3, root: 0}]],

    // '0 4 7 8' Major ♭6
    [401, [{name: 'Maj ♭6', cardinal: 4, sortOrder: 6, root: 0}]],

    // '0 2 4 9' Major 9 (no 7)
    [149, [{name: 'Maj 9 (no 7)', cardinal: 4, sortOrder: 6, root: 0}]],

    //
    // // Seventh ///////////////////////////////////

    // '0 4 7 10' 7
    [1169, [{name: '7', cardinal: 4, sortOrder: 3, root: 0}]],

    // '0 4 8 10' 7 ♯5
    [1297, [{name: '7 ♯5', cardinal: 4, sortOrder: 8, root: 0}]],

    // '0 4 6 10' 7 ♭5 // or 7 ♯11
    [1105, [{name: '7 ♭5', cardinal: 4, sortOrder: 6, root: 0}, {name: '7 ♯11', cardinal:4, sortOrder: 6, root: 0}]],

    // '0 4 5 10' sus4 M7 bass 5
    [1073, [{name: 'M7 sus4 /5', cardinal: 4, sortOrder: 15, root: 5}]],

    // '0 5 7 10' 7 sus4 7 (no third)
    [1185, [{name: 'sus4 7', cardinal: 4, sortOrder: 15, root: 0}]],

    // '0 5 7 11'  sus4 M7
    [2209, [{name: 'M7 sus4', cardinal: 4, sortOrder: 15, root: 0}]],

    // '0 4 8 11' Augmented Major 7
    [2321, [{name: 'aug M7', cardinal: 4, sortOrder: 5, root: 0}]],

    // '0 3 4 8' Maj ♭6/3rd
    [281, [{name: 'Maj ♭6/3rd', cardinal: 4, sortOrder: 7, root: 8}]],

    // '0 2 7 10'  7 sus2
    [1157, [{name: '7 sus2', cardinal: 4, sortOrder: 7, root: 0}]],

    // '0 2 6 10' 7 ♯11 sus2
    [1093, [{name: '7 ♯11 sus2', cardinal: 4, sortOrder: 11, root: 0}]],

    // '0 2 4 10' Seventh 9 no 5
    [1045, [{name: '9 no 5', cardinal: 4, sortOrder: 8, root: 0}]],

    // '0 2 4 6' 7 9 #11 (no 5 no 7)
    [85, [{name: '7 9 #11', cardinal: 4, sortOrder: 20, root: 0}]],

    //'0 2 8 10'  7 9 #11 / 3rd
    [1285, [{name: ' 7 9 #11/3rd', cardinal: 4, sortOrder: 23, root: 8}]],

    // '0 2 4 10'  7 b9 no 5 [JYF 2010]
    [1043, [{name: '7 ♭9 no 5', cardinal: 4, sortOrder: 10, root: 0}]],

    // '0 2 4 10'  7 b9 no 5 [JYF 2010]
    [1043, [{name: '7 ♭9 no 5', cardinal: 4, sortOrder: 10, root: 0}]],

    // '0 6 9 10'  7 ♭5 6 no 3 [JYF 2010]
    [1601, [{name: '7 ♭5 6 no 3', cardinal: 4, sortOrder: 10, root: 0}]],

    // '0 3 4 6'  ♭5 #9 no 7 [JYF 2010]
    [89, [{name: '♭5 #9 no 7', cardinal: 4, sortOrder: 10, root: 0}]],


    //
    // // Minor ///////////////////////////////////
    //

    // '0 3 7 10'
    [1161, [{name: 'm7', cardinal: 4, sortOrder: 2, root: 0}]],
    // // bass third taken by major 6 - pid 657
    // [297, [{name: 'm7/5th', cardinal: 4, sortOrder: 5, root: 5}]],
    // [549, [{name: 'm7/7th', cardinal: 4, sortOrder: 5, root: 2}]],


    // '0 3 7 11'
    [2185, [{name: 'm M7', cardinal: 4, sortOrder: 4, root: 0}]],

    // '0 3 8 10' minor ♯5 or ♭6
    [1289, [{name: 'm7 ♯5', cardinal: 4, sortOrder: 8, root: 0}]],

    // '0 3 7 9'
    [649, [{name: 'm6', cardinal: 4, sortOrder: 5, root: 0}]],

    // '0 3 7 8'
    [393, [{name: 'm ♭6', cardinal: 4, sortOrder: 7, root: 0}, {name: 'M7/3rd', cardinal:4, sortOrder: 7, root: 8}]],

    // '0 3 5 10' minor 7 add 11
    [1065, [{name: 'm7 add 11', cardinal: 4, sortOrder: 6, root: 0}]],

    // '0 3 6 10' Half-Diminished seventh or m6/6th
    [1097, [{name: 'ø', cardinal: 4, sortOrder: 3, root: 0}, {name: 'm6/6th', cardinal:4, sortOrder: 3, root: 3}]],

    // '0 3 6 9'
    [585, [{name: 'dim7', cardinal: 4, sortOrder: 3, root: 0}]],

    // ///// 5-chords  ///// ///// ///// ///// ///// /////

    // '0 1 4 7 10'
    [1171, [{name: '7 ♭9', cardinal: 5, sortOrder: 7, root: 0}]],

    // '0 2 4 7 10'
    [1173, [{name: '7 9', cardinal: 5, sortOrder: 7, root: 0}]],

  ])


  /**
   * From pcs, get list of possible currents chords, according to chordsPidKeyWithZeroAsRoot collection
   * @param pcs
   * @param conf
   * @return string[] list of pcs in string representation as '0 3 6 9' (cardinal = nPitches)
   */
  static getKeysChord(pcs: IPcs,
                           conf: {
                             nPitches ?: number,
                             includeInversion?: boolean,
                             extended?: boolean }={}
  ): number[] {

    let chordPcsList: number[] = []
    if (pcs.cardinal < 3) return chordPcsList

    const nPitches = conf.nPitches ?? 3
    const includeInversion = conf.includeInversion ?? false
    const extendedChord = conf.extended ?? true

    const pivot = pcs.getMappedPivot() ?? 0

    // translate where pivot = 0, for make a key
    const pidPcs = pcs.transposition(-pivot).unMap().pid()

    // if pcs.cardinal === nPitches, there is zero or one chord possible
    if (pcs.cardinal === nPitches) {
      if (ChordNaming.chordsPidKeyWithZeroAsRoot.get(pidPcs)) {
        if (ChordNaming.chordsPidKeyWithZeroAsRoot.get(pidPcs)![0].root === 0
          || (ChordNaming.chordsPidKeyWithZeroAsRoot.get(pidPcs)![0].root > 0 && includeInversion)
        ) {
            chordPcsList.push(pidPcs)
        }
      }
      // max one name
      return chordPcsList
    }

    // search if possible chords predefined (pidChord) in list chordsPidKeyWithZeroAsRoot match with pcs (pidPcs)
    ChordNaming.chordsPidKeyWithZeroAsRoot.forEach((value, pidChord) => {
      // Applies bitwise operator AND between pidChord and pidPcs. If result is pidChord, then pcs includes chord
      if ( (pidChord & pidPcs) === pidChord && value[0].cardinal === nPitches) {
        if (value[0].root === 0 || value[0].root > 0 && includeInversion) {
          if (extendedChord) {
            // get all
            chordPcsList.push(pidChord)
          } else {
            if (value[0].sortOrder <= 5) {
              chordPcsList.push(pidChord)
            }
          }
          // chordPcsList.push(pidChord)
        }
      }
    })

    // assert nMapping to be 12
    // sort on sortOrder property
    if (chordPcsList.length > 1) {
      chordPcsList.sort((s1, s2) => {
        const orderChord1 = ChordNaming.chordsPidKeyWithZeroAsRoot.get(s1)![0].sortOrder ?? 42  // normally sortOrder is set
        const orderChord2 = ChordNaming.chordsPidKeyWithZeroAsRoot.get(s2)![0].sortOrder ?? 42  // idem
        return orderChord1 - orderChord2
      })
    }
    return chordPcsList
  }

  /**
   * Get chord name(s) if exists else empty string
   * Root chord is given by iPivot
   * @param pcs assert pcs.n == 12
   *    The caller will have to check before calling this function, and possibly call unMap() before
   * @param nbPitches value of k (kChord)
   */
  static getChordName(pcs: IPcs, nbPitches: number = 3): string {
    let chordsNPitches: number[] = []
    let inversionOfRootPivot : number | undefined = undefined
    if (nbPitches >= 3 && nbPitches <= 5) {
      chordsNPitches = ChordNaming.getKeysChord(pcs, {nPitches:nbPitches, includeInversion:true, extended:true})
      if (chordsNPitches.length === 0) {
        // not found? try to find if it is a chord inversion of a known chord
        let pcsNext = pcs
        for (let i = 0; i < pcs.cardinal-1 ; i++) {
          pcsNext = pcsNext.modulation("Next")
          chordsNPitches = ChordNaming.getKeysChord(pcsNext, {nPitches:nbPitches, includeInversion:true, extended:true})
          if (chordsNPitches.length > 0) {
            inversionOfRootPivot = pcsNext.iPivot
            break
          }
        }

      }
    }

    if (chordsNPitches.length === 0) {
      return ''
    }

    const chordNames = ChordNaming.chordsPidKeyWithZeroAsRoot.get(chordsNPitches[0])

    if (!chordNames) {
      return ''
    }

    // some chords have more than one name, separated by a separator
    const separator = " ~ "

    let nameRoot = ''
    let theChordNames = ''
    // get different chord names and their root name
    for (const chordName of chordNames) {
      const _chordName = inversionOfRootPivot !== undefined && chordName.root === 0
        // inversion chord
        ? chordName.name + "/" + this.inversionSuffix[(pcs.n + (pcs.iPivot ?? 0) - inversionOfRootPivot) % pcs.n]

        // not inversion chord
        : chordName.name

      // which nameRoot name ?
      let indexNameRoot =
        inversionOfRootPivot !== undefined && chordName.root === 0
          ? inversionOfRootPivot //  case chord inversion dynamically defined
          : ((pcs.iPivot ?? 0) + chordName.root) % pcs.n // chordName.root case chord inversion statically defined

      // console.log("indexNameRoot = ", indexNameRoot)
      if (ChordNaming.INDEX_ALTERED_NOTES.includes(indexNameRoot)) {
        // select # or b.
        // ref cycle of fifths
        // https://fr.wikipedia.org/wiki/Cycle_des_quintes#/media/Fichier:Circle_of_fifths_deluxe_4_french.svg
        if (indexNameRoot > 6) {
          // FLAT_NAME
          nameRoot = ChordNaming.NOTE_NAMES_FLAT[indexNameRoot]
          // exception when chord
          if ([3, 4, 5].includes(pcs.cardinal)) {
            // based on score notation for set name root
            if (!ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs).substring(0, 2).includes(nameRoot[0])) {
              nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
            }
          }
        } else {
          // SHARP_NAME
          nameRoot = ChordNaming.NOTE_NAMES_SHARP[indexNameRoot]
          // exception when chord
          if ([3, 4, 5].includes(pcs.cardinal)) {
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
      // add new name tO theChordNames (some pcs have more than one name)
      theChordNames = theChordNames
        ? `${theChordNames}${separator}${nameRoot}${_chordName}`
        : `${nameRoot}${_chordName}`
    }

    return theChordNames
  }


}
