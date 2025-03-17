import {ClockDrawing} from "./ClockDrawing";
import {UIPcsDto} from "./UIPcsDto";
import {ElementRef} from "@angular/core";
import {FormDraw} from "./FormDraw";

export class ClockFormDraw extends FormDraw {
  private _clockDrawing: ClockDrawing;

  constructor() {
    super();
  }

  override updateGraphicContext(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return

    // @ts-ignore
    let context: CanvasRenderingContext2D = canvas.nativeElement.getContext('2d');

    let len = pcsDto.width

    canvas.nativeElement.width = len
    canvas.nativeElement.height = len // square

    this._clockDrawing = new ClockDrawing({
      ipcs: pcsDto.pcs,
      ctx: context,
      width: len,
      height: len, // square
      pc_pivot_color: 'red', // this._pcsDto.uiMusaic.pivotColor,
      pc_color_fill: pcsDto.uiClock.colorPitchOn,
      drawPivot: pcsDto.showPivot,
      segmentsLineDash: [[1, 2, 2, 1], [2, 3]] // median, inter
    })
  }

  override drawForm(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this.updateGraphicContext(pcsDto, canvas)
    this._clockDrawing.draw()
  }
}
