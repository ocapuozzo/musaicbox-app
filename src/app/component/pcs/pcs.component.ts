 import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NgClass} from "@angular/common";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {IPcs} from "../../core/IPcs";
import {FormDraw} from "../../ui/FormDraw";
import {MusaicFormDraw} from "../../ui/MusaicFormDraw";
import {ClockFormDraw} from "../../ui/ClockFormDraw";
import {ScoreFormDraw} from "../../ui/ScoreFormDraw";
 import {StringHash} from "../../utils/StringHash";
 import {ScoreNotationComponent} from "../score-notation/score-notation.component";

/**
 * Wrapper for various representation : musaic, clock, score... for whiteboard page
 * Managed by : pcsDto, DOM element and event listeners, manager-page-wb.service.ts
 */
@Component({
  selector: 'app-pcs',
  standalone: true,
  imports: [
    NgClass,
    ScoreNotationComponent
  ],
  templateUrl: './pcs.component.html',
  styleUrl: './pcs.component.css'
})
export class PcsComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  randomId : string = ''
  private formDrawing : FormDraw
  _pcsDto = new UIPcsDto({colorPitchOff: 'white', colorPitchOn:'black'})

  @Input() ipcs: IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() opaque: boolean = true

  // for template attribut
  get rounded(): boolean {
    return this._pcsDto.uiMusaic.rounded && this._pcsDto.indexFormDrawer === UIPcsDto.MUSAIC
  }

  get pcsDto() : UIPcsDto {
    return this._pcsDto
  }
  @Input() set pcsDto(value : UIPcsDto) {
    this._pcsDto = value
    this.drawForm()
  }

  constructor() {
    this.randomId = StringHash.guidGenerator()
  }

  ngAfterViewInit() {
    this.drawForm()
  }

  static MUSAIC_INDEX = 0
  static CLOCK_INDEX = 1
  static SCORE_INDEX = 2
  get scoreView(): boolean {
    return  this._pcsDto.indexFormDrawer === 2
  }

  drawForm() {
    // if (!this.canvas) return
    switch (this._pcsDto.indexFormDrawer) {
      case PcsComponent.MUSAIC_INDEX :
        this.formDrawing =  new MusaicFormDraw()
        break
      case PcsComponent.CLOCK_INDEX :
        this.formDrawing =  new ClockFormDraw()
        break
      case PcsComponent.SCORE_INDEX :
        this.formDrawing =  new ScoreFormDraw(this.randomId)
        break
      default :
        this.formDrawing =  new ClockFormDraw()
    }

    this.formDrawing.drawForm(this._pcsDto, this.canvas);
  }

}
