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
    const visualObj = abcjs.renderAbc(
      "paper-" + this.randomId,
      codeAbc,
      {
        //scale: .9,
        staffwidth: len,
        paddingleft: 0,
        paddingright: 10,
        responsive: "resize"
      })[0];
    if (abcjs.synth.supportsAudio()) {
      // for css integration, see angular.json (architect/build/options/styles)
      let synthControl = new abcjs.synth.SynthController();
      synthControl.load("#abc-audio-" + this.randomId, null, {displayRestart: false, displayPlay: true, displayProgress: true});
      synthControl.setTune(visualObj, false,  {
        defaultQpm: 280, // no change...
        qpm: 280, // no change...
        onEnded: () => {},
      } )
    } else {
      const id= `abc-audio-${this.randomId}`
      document.querySelector(`#${id}`)!.innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>"
    }
  }

}
