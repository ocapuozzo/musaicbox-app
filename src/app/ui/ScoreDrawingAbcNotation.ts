/**
 * Copyright (c) 2019. Olivier Capuozzo
 *
 * This file is part of the musaicbox project
 *
 * (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 * For the full copyright and license information, please view the README.md
 * file on git server.
 */

import {IPcs} from "../core/IPcs";
import {UIPcsDto} from "./UIPcsDto";
import abcjs from "abcjs";

export class ScoreDrawingAbcNotation {
  static lettersSharpedNotation: string[] = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  static lettersFlattedNotation: string[] = ['C', '_D', 'D', '_E', 'E', 'F', '_G', 'G', '_A', 'A', '_B', 'B'];
  pcsDto: UIPcsDto
  // ctx: CanvasRenderingContext2D
  randomId: string = ""

  constructor(
    x: {
      idElement?: string
      pcsDto?: UIPcsDto
    } = {}) {
    if (!x.idElement) throw Error('Element Id waiting')
    this.randomId = x.idElement
    this.pcsDto = x.pcsDto ?? new UIPcsDto()
  }

  /**
   * from PCS to score notation treble key
   * rule1 : Result has only alteration notes sharp and flat (no natural)
   * rule2 : Preference sharp over flat. Ex : A A# G, no A Gb G (avoid natural alteration)
   * rule3 : Preference for add a new spelling note, no existing based. Ex: C Db E, no C C# E
   * rule4 : no alteration double sharp or double flat
   * rule5 : no natural enharmonic. Example : F flat => E
   * rule6 : when pcs is chord (has chord name) so preference minor third over augmented second and
   *         diminished fifth over augmented fourth
   */
  static fromPcsToABCNotation(pcs : IPcs): string {
    if (!pcs) return "";

    // suffix add by caller (better for unit test)
    // let suffix = 'X:1\nL: 1/4\nK:C\n';

    let notes = '';
    let chord = '[ ';

    let n = pcs.getMappedBinPcs().length;

    const alterationNotesForChange = [1, 3, 6, 8, 10]

    let pcsMapped = pcs.n !== 12 ? pcs.unMap() : pcs

    let pivot = pcsMapped.iPivot ?? 0
    let prevNote = pcsMapped.abinPcs[(n + pivot - 1) % n] === 1 ? ScoreDrawingAbcNotation.lettersSharpedNotation[(n + pivot - 1) % n] : 'X'
    if (prevNote.length > 1) {
      prevNote = prevNote[1] // _A, ^A => A
    }
    // console.log("pivot = ", pivot)
    for (let i = pivot; i < n + pivot; i++) {
      let index = i % n
      if (pcsMapped.abinPcs[index] === 1) {
        let note
        if (i == pivot && i > 6) {
          note = ScoreDrawingAbcNotation.lettersFlattedNotation[index]
        } else {
          note = ScoreDrawingAbcNotation.lettersSharpedNotation[index]
        }

        if (alterationNotesForChange.indexOf(index) !== -1) {
          // index is in [1, 3, 6, 8, 10]
          // change # by b ?
          // console.log('note = ', note, '  prevNote = ', prevNote )
          if (pcsMapped.abinPcs[index + 1] === 0 && note.includes(prevNote)) {
            note = "_" + ScoreDrawingAbcNotation.lettersSharpedNotation[index + 1]
          }
        }

        prevNote = note.length === 1 ? note : note[1] // _A, ^A => A

        // Make pitches always up iPivot pitch
        // https://abcnotation.com/blog/2010/01/31/how-to-understand-abc-the-basics/
        if (index < pivot) {
          note += "'"
        }

        notes = notes + ' ' + note;
        chord = chord + note;
      }
    }// end for

    // TODO hack for G# Major scales... prefer sharp (it is hard to place 12 to 7 tonal... must do better)
    if (pcsMapped.id === 32106) {
      notes = "^F^G^AB^C'^D'^E'"
    }

    // note : 0 3 6 9 => C D# F# A   (but waiting : C Eb Gb A)
    // 1,5,8,11 => Db F Ab B (Cb)   or C# F (E#) G# B  aie...
    // 1,3,7,10 pivot = 3
    // 0,3,6,8  pivot:0 Aie !!! third is D# will be Eb ?? but chord no name - only with pivot=8
    //                 it is Ab7/3 bass third
    // TODO refactor with IS logic ?
    if ([3, 4].includes(pcsMapped.cardinal) /*&& pcsMapped.getChordName()*/) {
      // chord has name, try minor third spelling Eb and diminished fifth (5b) and seventh...

      // third is the 3d note from root
      // fifth is the 5e note from root

      const orderedChar = "CDEFGABCDEFGAB"

      let noteArray = notes.trim().split(' ')

      // console.log("noteArray =", noteArray)

      // ex :  C ^D' ^F  => C D F
      let noAlteredNotes = noteArray.map(
        value => value.length > 1
          ? value.length >= 2 ? value[1] : value[0]
          : value)

      // TRY to "step third", so one on two by a loop (third (1), fifth (2) and seventh (3) )
      // Ex : C D F  => C E G (succession of thirds)
      let intervallicStructure = pcs.is()
      // console.log('intervallicStructure = ', intervallicStructure)
      // console.log('noteArray =', noteArray)

      // spelling third minor or major
      if ([3,4].includes(intervallicStructure[0])) {
        const root = noAlteredNotes[0]
        const third = noAlteredNotes[1]
        const iRoot = orderedChar.indexOf(root)
        if (orderedChar[iRoot + 2] !== third) {
          if (noteArray[0].startsWith('^')) {
            // change root
            const indexLetters = this.lettersSharpedNotation.indexOf(noteArray[0].substring(0,2))
            noteArray[0] = this.lettersFlattedNotation[indexLetters] + (noteArray[0].endsWith("'") ? "'" : "")
            if (noteArray[0].length >= 2) {
              noAlteredNotes[0] = noteArray[0][1]
            } else { // no alteration
              noAlteredNotes[0] = noteArray[0][0]
            }
          } else if (noteArray[1].startsWith('^')) {
            // change third
            const indexLetters = this.lettersSharpedNotation.indexOf(noteArray[1].substring(0,2))
            noteArray[1] = this.lettersFlattedNotation[indexLetters] + (noteArray[1].endsWith("'") ? "'" : "")
            if (noteArray[1].length >= 2) {
              noAlteredNotes[1] = noteArray[1][1]
            } else { // no alteration
              noAlteredNotes[1] = noteArray[1][0]
            }
          }
        }
      }
      // spelling fifth
      if ([6, 7, 8].includes(intervallicStructure[0] + intervallicStructure[1])) {
        // 7 semitones == fifth (6 => dim and 8 => aug)
        const root = noAlteredNotes[0]
        const fifth = noAlteredNotes[2]
        const iRoot = orderedChar.indexOf(root)
        if (orderedChar[iRoot + 4] !== fifth) { // fifth is distance of 5, so 4 steps... from root
          if (noteArray[2].startsWith('^')) {
            const indexLetters = this.lettersSharpedNotation.indexOf(noteArray[2].substring(0,2))
            noteArray[2] = this.lettersFlattedNotation[indexLetters] + (noteArray[2].endsWith("'") ? "'" : "")
            if (noteArray[2].length >= 2) {
              noAlteredNotes[2] = noteArray[2][1]
            } else { // no alteration
              noAlteredNotes[2] = noteArray[2][0]
            }
          }
        }
      }

      // now check if seventh is step one note from root
      if (pcsMapped.cardinal === 4) {
        let indexSeventh = orderedChar.indexOf(noAlteredNotes[noAlteredNotes.length - 1])
        let indexRoot = orderedChar.indexOf(noAlteredNotes[0])
        if (Math.abs(indexSeventh - indexRoot) > 1) {
          // change spelling. Swap sharp to flat, may be no diff if not a altered note
          // because rule 5 (no natural enharmonic Cb => B) Ex : 1,5,8,11
          let noteToChange = noteArray[noteArray.length-1]
          if (noteToChange.startsWith('^')) {
            // normally always true
            const quoted = noteToChange.endsWith("'")
            noteToChange = noteToChange.substring(0,2)
            const indexNoteToChange = ScoreDrawingAbcNotation.lettersSharpedNotation.indexOf(noteToChange)
            noteArray[noteArray.length-1] =
              ScoreDrawingAbcNotation.lettersFlattedNotation[indexNoteToChange] + (quoted ? "'" : "")
          }
        }
      }
      // console.log(`noteArray = ${noteArray}`)
      notes = noteArray.join(' ')

    } // end 3 or 4chord

    chord = '' //(this.pcsList.cardinal < 5) ? chord + ' ]  \n' : '' // experimental
    notes = chord ? notes + '|' : notes

    return notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

  drawScore() {
    const len = this.pcsDto.width
    const suffix = 'X:1\nL: 1/4\nK:C\n';
    const codeAbc = suffix + ScoreDrawingAbcNotation.fromPcsToABCNotation(this.pcsDto.pcs)

    // https://configurator.abcjs.net/visual/
    // console.log("width = ", len, "score = ", this.fromPcsToScoreNotation)

    abcjs.renderAbc(
      "paper-" + this.randomId,
      codeAbc,
      {
        //scale: .9,
        staffwidth: len,
        // paddingleft: 0,
        // paddingright: 10,
        // paddingtop:20,
        responsive: "resize"
      });
  }
}
