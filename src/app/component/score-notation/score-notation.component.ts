import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import * as abcjs from "abcjs";
import {StringHash} from "../../utils/StringHash";

@Component({
  selector: 'app-score-notation',
  standalone: true,
  imports: [],
  templateUrl: './score-notation.component.html',
  styleUrl: './score-notation.component.css'
})
export class ScoreNotationComponent {
  @ViewChild('containercanvas', {static: false}) containerCanvas: ElementRef<HTMLCanvasElement>;
  static lettersSharpedNotation: string[] = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  private _pcs: IPcs

  randomId: string = ""

  @Input() set pcs(value: IPcs) {
    this._pcs = value
    this.refresh()
  }

  get pcs(): IPcs {
    return this._pcs
  }

  constructor() {
    this.randomId = StringHash.guidGenerator()
  }

  ngAfterViewInit() {
    this.refresh();
  }

  refresh() {
    // console.log("this.fromPcsToScoreNotation :" + this.fromPcsToScoreNotation)
    // https://configurator.abcjs.net/visual/

    if (!this.containerCanvas) return

    let len = this.containerCanvas.nativeElement.clientWidth

    abcjs.renderAbc(
      "paper-" + this.randomId,
      this.fromPcsToScoreNotation,
      {
        //scale: .9,
        staffwidth: len,
        paddingleft: 0,
        paddingright: 10,
        responsive: "resize"
      });

  }

  /**
   * from PCS to score notation treble key
   * rule1 : Result has only alteration notes sharp and flat (no natural)
   * rule2 : Preference sharp over flat. Ex : A A# G, no A Gb G (avoid natural alteration)
   * rule3 : Preference for add a new spelling note, no existing based. Ex: C Db E, no C C# E
   * rule4 : no alteration double sharp or double flat
   * rule5 : no natural enharmonic. Example : F flat => E
   * rule6 : when pcs is chord (has chord name) so preference minor third over second augmented and
   *         diminished fifth over augmented fourth
   */
  get fromPcsToScoreNotation(): string {
    if (!this.pcs) return "";

    let suffix = 'X:1\nL: 1/4\nK:C\n';
    let notes = '';
    let chord = '[ ';

    let n = this.pcs.getMappedBinPcs().length;

    const alterationNotesForChange = [1, 3, 6, 8, 10]

    let pcsMapped = this.pcs

    if (this.pcs.n != 12) {
      pcsMapped = new IPcs({binPcs: this.pcs.getMappedBinPcs()})
      pcsMapped.setPivot(this.pcs.templateMappingBinPcs[this.pcs.getPivot() ?? 0])
    }

    let pivot = pcsMapped.iPivot ?? 0
    let prevNote = pcsMapped.abinPcs[(n + pivot - 1) % n] === 1 ? ScoreNotationComponent.lettersSharpedNotation[(n + pivot - 1) % n] : 'X'
    if (prevNote.length > 1) {
      prevNote = prevNote[1] // _A, ^A => A
    }
    // console.log("pivot = ", pivot)
    for (let i = pivot; i < n + pivot; i++) {
      let index = i % n
      if (pcsMapped.abinPcs[index] === 1) {
        let note = ScoreNotationComponent.lettersSharpedNotation[index]
        if (alterationNotesForChange.indexOf(index) !== -1) {
          // index is in [1, 3, 6, 8, 10]
          // change # by b ?
          // console.log('note = ', note, '  prevNote = ', prevNote )
          if (pcsMapped.abinPcs[index + 1] === 0 && note.includes(prevNote)) {
            note = "_" + ScoreNotationComponent.lettersSharpedNotation[index + 1]
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
    if (this.pcs.id === 32106) {
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

      // try to "step third", so one on two
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
          // /* E -> _F, B -> _C,*/ ^D -> _E, etc.
          if (/*noteArray[i].startsWith("E") || noteArray[i].startsWith("B") ||*/ noteArray[i].startsWith("^")) {
            if (noteArray[i].indexOf("'") > 0 || third === 'C') {
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
    } // en 3 or 4chord

    chord = '' //(this.pcsList.cardinal < 5) ? chord + ' ]  \n' : '' // experimental
    notes = chord ? notes + '|' : notes

    return suffix + notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

}
