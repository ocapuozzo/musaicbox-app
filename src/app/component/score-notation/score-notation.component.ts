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
   * Apply rule1 : Result has only alteration notes sharp and flat (no natural)
   * Apply rule2 : no alteration double sharp or double flat
   * Apply rule3 : no natural enharmonic. Example : F flat => E
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
    let prevNote = ScoreNotationComponent.lettersSharpedNotation[(n+pivot-1) % n]
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
          if ( pcsMapped.abinPcs[index + 1] === 0 && note.includes(prevNote) ) {
            note = "_" + ScoreNotationComponent.lettersSharpedNotation[index + 1]
          }
        }

        prevNote = note.length === 1 ? note : note[1] // _A, ^A => A

        // Make pitches always up iPivot pitch
        // http://abcnotation.com/blog/2010/01/31/how-to-understand-abc-the-basics/
        if ((i % n) < pivot) {
          note += "'"
        }

        notes = notes + note;
        chord = chord + note;
      }
    }
    // TODO hack for G# Major scales... it is hard to place 7 in 12... Must do better
    if (this.pcs.id === 32106) {
      notes = "^F^G^AB^C'^D'^E'"
    }
    chord = '' //(this.pcsList.cardinal < 5) ? chord + ' ]  \n' : '' // experimental
    notes = chord ? notes + '|' : notes

    return suffix + notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

}
