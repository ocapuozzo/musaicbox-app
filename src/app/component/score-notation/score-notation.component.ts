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
  static lettersNotation: string[] = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  private _pcs : IPcs

  randomId : string=""

  @Input() set pcs(value : IPcs) {
    this._pcs = value
    this.refresh()
  }
  get pcs() : IPcs {
    return this._pcs
  }


constructor() {
    this.randomId = StringHash.guidGenerator()
}

  ngAfterViewInit() {
    this.refresh();
  }

  refresh() {
    // console.log("this.tune :" + this.tune)
    // https://configurator.abcjs.net/visual/

    if (! this.containerCanvas) return

    let len = this.containerCanvas.nativeElement.clientWidth

    abcjs.renderAbc(
      "paper-" + this.randomId,
      this.tune,
      {
        //scale: .9,
        staffwidth: len,
        paddingleft: 0,
        responsive: "resize"
      });

  }

  // TODO make pivot low pitch
  get tune(): string {
    if (!this.pcs) return "";

    let suffix = 'X:1\nL: 1/4\nK:C\n';
    let notes = '';
    let chord = '[ ';

    let n = this.pcs.getMappedBinPcs().length;

    const someNotesForChange = [1, 3, 6, 8, 10]

    for (let i = this.pcs.iPivot ?? 0; i < n + (this.pcs.iPivot ?? 0); i++) {
      if (this.pcs.getMappedBinPcs()[i % n] === 1) {
        let note = ScoreNotationComponent.lettersNotation[i % n];
        if (someNotesForChange.indexOf(i % n) !== -1) {
          // change # by b
          if (this.pcs.getMappedBinPcs()[(i - 1) % n] === 1 &&
              this.pcs.getMappedBinPcs()[(i + 1) % n] !== 1) {
            note = "_" + ScoreNotationComponent.lettersNotation[(i + 1) % n]
          }
        }
        // case third if #D and not E, then bE
        if ( note == '^D') {
          if (this.pcs.getMappedBinPcs()[4] === 0) {
            note = '_E'
          }
        } else if ( note == '^A') {
          if (this.pcs.getMappedBinPcs()[9] === 0) {
            note = '_B'
          }
        }

        // TODO make pitches always up iPivot pitch
        // http://abcnotation.com/blog/2010/01/31/how-to-understand-abc-the-basics/
        if ((i % n) < (this.pcs.iPivot ?? 0)) {
          note += "'"
        }
        notes = notes + note;
        chord = chord + note;
      }
    }
    chord = '' //(this.pcsList.cardinal < 5) ? chord + ' ]  \n' : '' // experimental
    notes = chord ? notes+'|' : notes

    return suffix + notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

}
