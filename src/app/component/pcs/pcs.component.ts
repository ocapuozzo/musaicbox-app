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

/**
 * Wrapper for various representation : musaic, clock, score... for whiteboard page
 * Managed by : pcsDto, DOM element and event listeners, manager-page-wb.service.ts
 */
@Component({
  selector: 'app-pcs',
  standalone: true,
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

  protected readonly UIPcsDto = UIPcsDto;

  protected readonly EightyEight = EightyEight;

  getPcsName() {
    if (this.pcsDto.showPivot && this.pcsDto.pcs.cardinal > 0) {
      return this.pcsDto.pcs.getMappedPcsStr() + "<sub>" + this.pcsDto.pcs.getMappedPivot() + "</sub>"
    }
    return this.pcsDto.pcs.getMappedPcsStr()
  }
}
