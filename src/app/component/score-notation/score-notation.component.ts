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
    // console.log("this.tune :" + this.tune)
    // https://configurator.abcjs.net/visual/

    if (!this.containerCanvas) return

    let len = this.containerCanvas.nativeElement.clientWidth

    abcjs.renderAbc(
      "paper-" + this.randomId,
      this.tune,
      {
        //scale: .9,
        staffwidth: len,
        paddingleft: 0,
        paddingright: 10,
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

    let pcsMapped = this.pcs
    if (this.pcs.n != 12) {
      pcsMapped = new IPcs({binPcs: this.pcs.getMappedBinPcs()})
      pcsMapped.setPivot(this.pcs.templateMappingBinPcs[this.pcs.getPivot() ?? 0])
    }

    let prevNote = ''
    for (let i = pcsMapped.iPivot ?? 0; i < n + (pcsMapped.iPivot ?? 0); i++) {
      if (pcsMapped.abinPcs[i % n] === 1) {
        let note = ScoreNotationComponent.lettersNotation[i % n];
        if (someNotesForChange.indexOf(i % n) !== -1) {
          // change # by b
          if (pcsMapped.abinPcs[(i - 1) % n] === 1 &&
            pcsMapped.abinPcs[(i + 1) % n] !== 1) {
            note = "_" + ScoreNotationComponent.lettersNotation[(i + 1) % n]
          }
        }
        // case third if #D and not E, then bE
        if (note == '^D') {
          if (pcsMapped.abinPcs[4] === 0) {
            note = '_E'
          }
        } else if (note == '^A' && prevNote.includes("A")) {
          if (pcsMapped.abinPcs[9] === 0) {
            note = '_B'
          }
        } else if (note == '^G' && prevNote.includes("G")) {
          if (pcsMapped.abinPcs[8] === 1) {
            note = '_A'
          }
        } else if (note == 'B' && prevNote.includes("B")) {
          if (pcsMapped.abinPcs[10] === 1 && pcsMapped.abinPcs[0] === 0) {
            note = "_C'"
          }
        }
        // // console.log('note = ' + note +  'bin = ' + this.pcs.getMappedBinPcs())

        // TODO make pitches always up iPivot pitch
        // http://abcnotation.com/blog/2010/01/31/how-to-understand-abc-the-basics/
        if ((i % n) < (pcsMapped.iPivot ?? 0)) {
          note += "'"
        }
        prevNote = note
        notes = notes + note;
        chord = chord + note;
      }
    }
    // TODO bad algo, I do hack for G# Major scales... it is hard to place 7 in 12...
    if (this.pcs.id === 32106) {
      notes = "^F^G^AB^C'^D'^E'"
    }
    chord = '' //(this.pcsList.cardinal < 5) ? chord + ' ]  \n' : '' // experimental
    notes = chord ? notes + '|' : notes

    return suffix + notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

}
