import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {FormDraw} from "../../ui/FormDraw";
import {MusaicFormDraw} from "../../ui/MusaicFormDraw";
import {ClockFormDraw} from "../../ui/ClockFormDraw";
import {ScoreFormDraw} from "../../ui/ScoreFormDraw";
import {StringHash} from "../../utils/StringHash";
import {ScoreNotationComponent} from "../score-notation/score-notation.component";
import {MatInput} from "@angular/material/input";

/**
 * Wrapper for various representation : musaic, clock, score... for whiteboard page
 * Managed by : pcsDto, DOM element and event listeners, manager-page-wb.service.ts
 */
@Component({
  selector: 'app-pcs',
  standalone: true,
  imports: [
    NgClass,
    ScoreNotationComponent,
    NgIf,
    MatInput
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

  // /**
  //  *  and if pcs cardinal is 3 or 4, and if chord name exists !
  //  */
  // @Input() showName: boolean = false

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

  get scoreView(): boolean {
    return this._pcsDto.indexFormDrawer === UIPcsDto.SCORE
  }


  drawForm() {
    // if (!this.canvas) return
    switch (this._pcsDto.indexFormDrawer) {
      case UIPcsDto.MUSAIC :
        this.formDrawing = new MusaicFormDraw()
        break
      case UIPcsDto.CLOCK :
        this.formDrawing = new ClockFormDraw()
        break
      case UIPcsDto.SCORE :
        this.formDrawing = new ScoreFormDraw(this.randomId)
        break
      case UIPcsDto.FREE_TEXT :
        // nothing to do (see html template)
        return
      default :
        this.formDrawing = new ClockFormDraw()
    }
    this.formDrawing.drawForm(this._pcsDto, this.canvas);
  }

  protected readonly UIPcsDto = UIPcsDto;

}
