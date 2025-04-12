import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NgClass} from "@angular/common";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {FormDraw} from "../../ui/FormDraw";
import {MusaicFormDraw} from "../../ui/MusaicFormDraw";
import {ClockFormDraw} from "../../ui/ClockFormDraw";
import {ScoreFormDraw} from "../../ui/ScoreFormDraw";
import {StringHash} from "../../utils/StringHash";
import {OctotropeFormDraw} from "../../ui/OctotropeFormDraw";
import {EightyEight} from "../../utils/EightyEight";
import {MatTooltip} from "@angular/material/tooltip";
import {animate, state, style, transition, trigger} from "@angular/animations";

/**
 * Wrapper for various representation : musaic, clock, score... for whiteboard page
 * Managed by : pcsDto, DOM element and event listeners, manager-page-wb.service.ts
 */
@Component({
  selector: 'app-pcs',
  standalone: true,
  animations: [
    // value of state come from pcsDto.currentCSSAnimationTransformationState
    // and set by manager-page-wb.service (doTransformAffine method)
    trigger('musaicTransformation', [
      // ...
      state(
        'ID',
        style({ }),
      ),
      state(
        'M5',
        style({
          transform:'rotate3d(1, 1, 0, 180deg)'
        }),
      ),
      state(
        'M7',
        style({
          transform: 'rotate3d(-1, 1, 0, 180deg)'
        }),
      ),
      state(
        'M11',
        style({
          transform: 'rotate(180deg)',
        }),
      ),

      transition('* => M11', [animate('1s')]),
      transition('* => M5', [animate('1s')]),
      transition('* => M7', [animate('1s')]),

    ])
  ],
  imports: [
    NgClass,
    MatTooltip
  ],
  templateUrl: './pcs.component.html',
  styleUrl: './pcs.component.css'
})
export class PcsComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  randomId: string = ''
  private formDrawing: FormDraw
  _pcsDto = new UIPcsDto({colorPitchOff: 'white', colorPitchOn: 'black'})


  @Input() opaque: boolean = true


  // for template attribute
  get rounded(): boolean {
    return this._pcsDto.uiMusaic.rounded && this._pcsDto.indexFormDrawer === UIPcsDto.MUSAIC
  }

  get pcsDto(): UIPcsDto {
    return this._pcsDto
  }

  @Input() set pcsDto(value: UIPcsDto) {
    this._pcsDto = value
    this.drawForm()
  }

  // https://stackoverflow.com/questions/36653678/angular2-input-to-a-property-with-get-set
  @Input() set pcColorSet(value: string) {
    this._pcsDto.colorPitchOn = value
  }

  constructor() {
    this.randomId = StringHash.guidGenerator()
  }

  ngAfterViewInit() {
    this.drawForm()
  }

  drawForm() {
    // if (!this.canvas) return
    const ALL_DRAWERS_INDEX = Array.from(UIPcsDto.ALL_DRAWERS.values())
    switch (this._pcsDto.indexFormDrawer) {
      case ALL_DRAWERS_INDEX[0] :
        this.formDrawing = new MusaicFormDraw()
        break
      case ALL_DRAWERS_INDEX[1] :
        this.formDrawing = new ClockFormDraw()
        break
      case ALL_DRAWERS_INDEX[2] :
        this.formDrawing = new ScoreFormDraw(this.randomId)
        break
      case ALL_DRAWERS_INDEX[3] :
        this.formDrawing = new OctotropeFormDraw()
        break
      case ALL_DRAWERS_INDEX[4] : // FREE_TEXT
        // nothing to do (see html template)
        return
      default :
        this.formDrawing = new ClockFormDraw()
    }
    this.formDrawing.drawForm(this._pcsDto, this.canvas);
  }

  getPcsName() {
    if (this.pcsDto.showPivot && this.pcsDto.pcs.cardinal > 0) {
      return this.pcsDto.pcs.getMappedPcsStr() + "<sub>" + this.pcsDto.pcs.getMappedPivot() + "</sub>"
    }
    return this.pcsDto.pcs.getMappedPcsStr()
  }

  protected readonly UIPcsDto = UIPcsDto;
  protected readonly EightyEight = EightyEight;


}
