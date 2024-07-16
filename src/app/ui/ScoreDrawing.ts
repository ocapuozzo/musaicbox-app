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

export class ScoreDrawing {
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
  get fromPcsToScoreNotation(): string {
    if (!this.pcsDto.pcs) return "";

    let suffix = 'X:1\nL: 1/4\nK:C\n';
    let notes = '';
    let chord = '[ ';

    let n = this.pcsDto.pcs.getMappedBinPcs().length;

    const alterationNotesForChange = [1, 3, 6, 8, 10]

    let pcsMapped = this.pcsDto.pcs

    if (this.pcsDto.pcs.n != 12) {
      pcsMapped = new IPcs({binPcs: this.pcsDto.pcs.getMappedBinPcs()})
      pcsMapped.setPivot(this.pcsDto.pcs.templateMappingBinPcs[this.pcsDto.pcs.getPivot() ?? 0])
    }

    let pivot = pcsMapped.iPivot ?? 0
    let prevNote = pcsMapped.abinPcs[(n + pivot - 1) % n] === 1 ? ScoreDrawing.lettersSharpedNotation[(n + pivot - 1) % n] : 'X'
    if (prevNote.length > 1) {
      prevNote = prevNote[1] // _A, ^A => A
    }
    // console.log("pivot = ", pivot)
    for (let i = pivot; i < n + pivot; i++) {
      let index = i % n
      if (pcsMapped.abinPcs[index] === 1) {
        let note = ScoreDrawing.lettersSharpedNotation[index]
        if (alterationNotesForChange.indexOf(index) !== -1) {
          // index is in [1, 3, 6, 8, 10]
          // change # by b ?
          // console.log('note = ', note, '  prevNote = ', prevNote )
          if (pcsMapped.abinPcs[index + 1] === 0 && note.includes(prevNote)) {
            note = "_" + ScoreDrawing.lettersSharpedNotation[index + 1]
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
    if (this.pcsDto.pcs.id === 32106) {
      notes = "^F^G^AB^C'^D'^E'"
    }

    // note : 0 3 6 9 => C D# F# A   (but waiting : C Eb Gb A)
    if ([3, 4].includes(pcsMapped.cardinal) && pcsMapped.getChordName()) {
      // chord has name, try minor third spelling Eb and diminished fifth (5b) and seventh...

      const orderedChar = "CDEFGABCDEFGAB"

      let noteArray = notes.trim().split(' ')

      // console.log("noteArray =", noteArray)

      // ex :  C ^D' ^F  => C D F
      let characterNoteArray = noteArray.map(
        value => value.length > 1
          ? value.indexOf("'") > 0 && value.length > 2 ? value[1] : value.indexOf("'") > 0 ? value[0] : value[1]
          : value)

      // TRY to "step third", so one on two by a loop (third (1), fifth (2) and seventh (3) )
      // Ex : C D F  => C E G (succession of thirds)
      for (let i = 1; i < 4; i++) {
        let charThird = characterNoteArray[i]  // D

        // console.log("pcs = ", pcsMapped.getPcsStr())
        // console.log("characterNoteArray = ", characterNoteArray)
        // console.log("charThird = ", charThird)

        const indexThird = orderedChar.indexOf(charThird)
        if (indexThird === orderedChar.indexOf(characterNoteArray[i-1]) + 1) {
          // change note
          let third = orderedChar[indexThird + 1] // take next
          // now replace noteArray[1] by third
          // E -> _F, B -> _C, ^D -> _E, etc.
          if (/*noteArray[i].startsWith("E") || noteArray[i].startsWith("B") ||*/ noteArray[i].startsWith("^")) {
            if (noteArray[i].indexOf("'") > 0 || third === 'C') { // abc logic
              noteArray[i] = "_" + third + "'"
            } else {
              noteArray[i] = "_" + third
            }
            characterNoteArray[i] = third
          }
        }
      } // end for
      notes = noteArray.join(' ')
      // console.log("notes =", notes)
    } // end 3 or 4chord

    chord = '' //(this.pcsList.cardinal < 5) ? chord + ' ]  \n' : '' // experimental
    notes = chord ? notes + '|' : notes

    return suffix + notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

  drawScore() {
    let len = this.pcsDto.width
    // https://configurator.abcjs.net/visual/
    // console.log("width = ", len, "score = ", this.fromPcsToScoreNotation)
    // let elt = document.getElementById('paper-'+this.randomId) as HTMLElement
    // console.log('elt : ', 'paper-'+this.randomId,  elt)
    abcjs.renderAbc(
      "paper-" + this.randomId,
      this.fromPcsToScoreNotation,
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
