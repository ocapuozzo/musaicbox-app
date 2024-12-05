import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {StringHash} from "../../utils/StringHash";
import {ScoreDrawingAbcNotation} from "../../ui/ScoreDrawingAbcNotation";
import abcjs, {MidiBuffer} from "abcjs";
import {AnimPitchService} from "../../service/anim-pitch.service";

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

  private iCurrentOrderPlaying: number = -1
  private idPcsCurrentPlaying: number = -1
  private createSynth: MidiBuffer;

  @Input() withChord : boolean = false

  @Input() set pcs(value: IPcs) {
    this._pcs = value
    this.refresh()
  }

  get pcs(): IPcs {
    return this._pcs
  }

  constructor(public animPitchService: AnimPitchService) {
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
    const codeAbc = suffix + ScoreDrawingAbcNotation.fromPcsToABCNotation(this.pcs, this.withChord)

    class CursorControl {
      constructor(public superThis: ScoreNotationComponent) {
      }

      beatSubdivisions = 2;

      onStart() {
        if (this.superThis.iCurrentOrderPlaying === -1) {
          this.superThis.iCurrentOrderPlaying = 0
          this.superThis.idPcsCurrentPlaying = this.superThis.pcs.id
        }
         // console.log("The tune has started playing.");
      }

      onFinished() {
        this.superThis.iCurrentOrderPlaying = -1
        this.superThis.animPitchService
          .notePlaying({
            idPcs: this.superThis.idPcsCurrentPlaying,
            indexPitchPlaying: this.superThis.iCurrentOrderPlaying
          })
         // console.log("The tune has stopped playing.");
      }

      onBeat (beatNumber: any) {
        // console.log("Beat " + beatNumber + " is happening.");
      }

      onEvent(event: any) {
        // a note is playing
        //  console.log("An event is happening", event);
        if (this.superThis.idPcsCurrentPlaying !== this.superThis.pcs.id) {
          // console.log("STOP")
          this.superThis.createSynth.stop() // does not work...
          return
        }

        this.superThis.iCurrentOrderPlaying++

        if (this.superThis.iCurrentOrderPlaying > this.superThis.pcs.cardinal) {
          this.superThis.iCurrentOrderPlaying = 1
        }
        // check current index
        const currentIndex =
          this.superThis.pcs.getVectorIndexOfPitchOrder(this.superThis.iCurrentOrderPlaying)

        // if ( this.superThis.iCurrentOrderPlaying < this.superThis.pcs.cardinal   )
        this.superThis.animPitchService
          .notePlaying({
            idPcs: this.superThis.idPcsCurrentPlaying,
            indexPitchPlaying: currentIndex
          })
      }
    }

    const cursorControl = new CursorControl(this);
    let abcOptions = {add_classes: true};
    let audioParams = {
      chordsOff: true,
      options: {qpm: 800} // does not work
    };

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


      this.createSynth = new abcjs.synth.CreateSynth();

      this.createSynth.init({
        visualObj: visualObj,
        options : {qpm:800, defaultQpm:800} // does not work
      }).then(function () {
        synthControl.setTune(visualObj, false, audioParams).then(function () {
          console.log("Audio successfully loaded.")
        }).catch(function (error) {
          console.warn("Audio problem:", error);
        });
      }).catch(function (error) {
        console.warn("Audio problem:", error);
      });
    } else {
      const id = `abc-audio-${this.randomId}`
      document.querySelector(`#${id}`)!.innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>"
    }

  }

}
