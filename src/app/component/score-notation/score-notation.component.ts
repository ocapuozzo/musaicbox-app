import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import * as abcjs from "abcjs";
import {StringHash} from "../../utils/StringHash";
import {ScoreDrawingAbcNotation} from "../../ui/ScoreDrawingAbcNotation";

@Component({
  selector: 'app-score-notation',
  standalone: true,
  imports: [],
  templateUrl: './score-notation.component.html',
  styleUrl: './score-notation.component.css'
})
export class ScoreNotationComponent {
  @ViewChild('containercanvas', {static: false}) containerCanvas: ElementRef<HTMLCanvasElement>;
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

    const len = this.containerCanvas.nativeElement.clientWidth
    const suffix = 'X:1\nL: 1/4\nK:C\n';
    const codeAbc = suffix + ScoreDrawingAbcNotation.fromPcsToABCNotation(this.pcs)

    abcjs.renderAbc(
      "paper-" + this.randomId,
      codeAbc,
      {
        //scale: .9,
        staffwidth: len,
        paddingleft: 0,
        paddingright: 10,
        responsive: "resize"
      });
  }

}
