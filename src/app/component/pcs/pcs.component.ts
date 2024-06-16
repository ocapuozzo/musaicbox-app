import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NgClass} from "@angular/common";
import {MusaicDrawing} from "../../ui/MusaicDrawing";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {IPcs} from "../../core/IPcs";
import {ClockFormDraw, FormDraw, MusaicFormDraw} from "../../ui/FormDraw";

/**
 * Wrapper for various representation : musaic, clock, score...
 */
@Component({
  selector: 'app-pcs',
  standalone: true,
  imports: [
    NgClass
  ],
  template: '<canvas #canvas id="canvas" [ngClass]="{\'roundedImageBorder roundedImageShadow\': rounded, \'musaic\': true}"></canvas>',
  styleUrl: './pcs.component.css'
})
export class PcsComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  private formDrawing : FormDraw
  _pcsDto = new UIPcsDto({colorPitchOff: 'white', colorPitchOn:'black'})

  @Input() ipcs: IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() opaque: boolean = true

  // for template attribut
  get rounded(): boolean {
    return this._pcsDto.uiMusaic.rounded
  }

  get pcsDto() : UIPcsDto {
    return this._pcsDto
  }
  @Input() set pcsDto(value : UIPcsDto) {
    this._pcsDto = value
    this.drawForm()
    // this.formDrawing.drawForm(this._pcsDto, this.canvas);
  }

  constructor() {
    // this.formDrawing =  new ClockFormDraw(this._pcsDto)
    this.formDrawing =  new MusaicFormDraw(this._pcsDto)
  }

  ngAfterViewInit() {
    //this.formDrawing.drawForm(this._pcsDto, this.canvas);
    this.drawForm()
  }

  drawForm() {
    if (!this.canvas) return
    if (this._pcsDto.indexFormDrawer === 0) {
      this.formDrawing =  new MusaicFormDraw(this._pcsDto)
    } else {
      this.formDrawing =  new ClockFormDraw(this._pcsDto)
    }
    this.formDrawing.drawForm(this._pcsDto, this.canvas);
  }

}
