import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NgClass} from "@angular/common";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {IPcs} from "../../core/IPcs";
import {FormDraw} from "../../ui/FormDraw";
import {MusaicFormDraw} from "../../ui/MusaicFormDraw";
import {ClockFormDraw} from "../../ui/ClockFormDraw";

/**
 * Wrapper for various representation : musaic, clock, score... for whiteboard page
 * Managed by : pcsDto, DOM element and event listeners, manager-page-wb.service.ts
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
  }

  ngAfterViewInit() {
    this.drawForm()
  }

  drawForm() {
    if (!this.canvas) return
    if (this._pcsDto.indexFormDrawer === 0) {
      this.formDrawing =  new MusaicFormDraw()
    } else {
      this.formDrawing =  new ClockFormDraw()
    }
    this.formDrawing.drawForm(this._pcsDto, this.canvas);
  }

}
