import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {StringHash} from "../../utils/StringHash";
import {ScoreDrawingAbcNotation} from "../../ui/ScoreDrawingAbcNotation";
import abcjs from "abcjs";

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

    class CursorControl  {
      beatSubdivisions = 2;
      onStart = function() {
        // console.log("The tune has started playing.");
      }
      onFinished = function() {
        // console.log("The tune has stopped playing.");
      }
      onBeat = function(beatNumber : any) {
        // console.log("Beat " + beatNumber + " is happening.");
      }
      onEvent = function(event : any) {
        // a note is playing
        // console.log("An event is happening", event);
      }
    }
    const cursorControl = new CursorControl();
    let abcOptions = { add_classes: true };
    let audioParams = { chordsOff: true, options: {qpm:290} };

    if (abcjs.synth.supportsAudio()) {
      let synthControl = new abcjs.synth.SynthController();
      synthControl.load("#abc-audio-" + this.randomId,
        cursorControl,
        {
          // displayLoop: true,
          displayRestart: false,
          displayPlay: true,
          displayProgress: true,
          // displayWarp: true
        }
      );

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
      // var visualObj = ABCJS.renderAbc("paper", abc, abcOptions);

      let createSynth = new abcjs.synth.CreateSynth();
      createSynth.init({ visualObj: visualObj }).then(function () {
        synthControl.setTune(visualObj, false, audioParams).then(function () {
          console.log("Audio successfully loaded.")
        }).catch(function (error) {
          console.warn("Audio problem:", error);
        });
      }).catch(function (error) {
        console.warn("Audio problem:", error);
      });
    } else {
        const id= `abc-audio-${this.randomId}`
        document.querySelector(`#${id}`)!.innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>"
    }


    //
    // const visualObj = abcjs.renderAbc(
    //   "paper-" + this.randomId,
    //   codeAbc,
    //   {
    //     //scale: .9,
    //     staffwidth: len,
    //     paddingleft: 0,
    //     paddingright: 10,
    //     responsive: "resize"
    //   })[0];
    // if (abcjs.synth.supportsAudio()) {
    //   // for css integration, see angular.json (architect/build/options/styles)
    //   let synthControl = new abcjs.synth.SynthController();
    //   synthControl.load("#abc-audio-" + this.randomId, null, { displayRestart: false, displayPlay: true, displayProgress: true});
    //   synthControl.setTune(visualObj, false,  {
    //     defaultQpm: 280, // don't work...
    //     qpm: 280, // don't work...
    //     onEnded: () => {},
    //   } )
    // } else {
    //   const id= `abc-audio-${this.randomId}`
    //   document.querySelector(`#${id}`)!.innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>"
    // }
  }

}
