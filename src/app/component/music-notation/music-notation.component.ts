import {Component, EventEmitter, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import * as abcjs from "abcjs";

@Component({
  selector: 'app-music-notation',
  standalone: true,
  imports: [],
  templateUrl: './music-notation.component.html',
  styleUrl: './music-notation.component.css'
})
export class MusicNotationComponent {
  static lettersNotation: string[] = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  private _ipcs : IPcs

  @Input() set ipcs(value : IPcs) {
    this._ipcs = value
    this.refresh()
  }
  get ipcs() : IPcs {
    return this._ipcs
  }

  ngAfterViewInit() {
    this.refresh();
  }

  get tune(): string {
    if (!this.ipcs) return "";

    let suffix = 'X:1\nL: 1/4\nK:C\n';
    let notes = '';
    let chord = '[ ';

    let n = this.ipcs.getReprBinPcs().length;

    const someNotesForChange = [1, 3, 6, 8, 10]

    for (let i = this.ipcs.iPivot ?? 0; i < n + (this.ipcs.iPivot ?? 0); i++) {
      if (this.ipcs.getReprBinPcs()[i % n] === 1) {
        let note = MusicNotationComponent.lettersNotation[i % n];
        if (someNotesForChange.indexOf(i % n) !== -1) {
          // change # in bemol
          if (this.ipcs.getReprBinPcs()[(i + 1) % n] !== 1) {
            note = "_" + MusicNotationComponent.lettersNotation[(i + 1) % n]
          }
        }
        // make notes always up
        // http://abcnotation.com/blog/2010/01/31/how-to-understand-abc-the-basics/
        if ((i % n) < (this.ipcs.iPivot ?? 0)) {
          note += "'"
        }
        notes = notes + note + " ";
        chord = chord + note;
      }
    }
    chord = ""; // (this.ipcs.cardinal() < 5) ? chord + ' ]  \n' : ''
    return suffix + notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

  refresh() {
    // console.log("this.tune :" + this.tune)
    // https://configurator.abcjs.net/visual/
    abcjs.renderAbc(
      "paper",
      this.tune,
      {
        scale: .9,
        staffwidth: 210,
        paddingleft: 1,
      });
  }

}
