import {UIPcsDto} from "./UIPcsDto";
import {MusaicDrawing} from "./MusaicDrawing";
import {ElementRef} from "@angular/core";
import {ClockDrawing} from "./ClockDrawing";

export class FormDraw {
  public updateGraphicContext(canvas : ElementRef<HTMLCanvasElement>) {}
  public drawForm(pcsDto: UIPcsDto, canvas : ElementRef<HTMLCanvasElement>) {}
}

export class MusaicFormDraw extends FormDraw {
    _pcsDto = new UIPcsDto()
    _musaicDrawing : MusaicDrawing

  constructor(pcsDto: UIPcsDto) {
    super();
    this._pcsDto = pcsDto;
  }

  override updateGraphicContext(canvas : ElementRef<HTMLCanvasElement>) {
    if (!canvas) return

    // @ts-ignore
    let context: CanvasRenderingContext2D = canvas.nativeElement.getContext('2d');

    let n = this._pcsDto.pcs.nMapping //getMappedBinPcs().length;
    let CEL_WIDTH = Math.floor(this._pcsDto.width / (n + 1));

    // avoid that this.CEL_WIDTH * (n + 1) > width,
    // is not always case ! TODO generalize with nbCellsPer line/row - not n based
    if (CEL_WIDTH * (n + 1) > this._pcsDto.width) {//this._preferredWidthInput) {
      CEL_WIDTH = CEL_WIDTH - 1
    }

    // adjust canvas size from CEL_WIDTH
    let preferredWidth = CEL_WIDTH * (n + 1)
    canvas.nativeElement.width = preferredWidth
    canvas.nativeElement.height = preferredWidth  // square

    this._pcsDto.uiMusaic.widthCell = CEL_WIDTH

    let newPcsDtp =
      new UIPcsDto({...this._pcsDto})

    this._pcsDto = newPcsDtp
    this._musaicDrawing = new MusaicDrawing({pcsDto:newPcsDtp, ctx:context})
  }

  override drawForm(pcsDto: UIPcsDto, canvas : ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this._pcsDto = pcsDto
    this.updateGraphicContext(canvas)
    this._musaicDrawing.drawMusaic()
  }
}


export class ClockFormDraw extends FormDraw {
  _pcsDto = new UIPcsDto()

  private _clockDrawing: ClockDrawing;

  constructor(pcsDto: UIPcsDto) {
    super();
    this._pcsDto = pcsDto;
  }

  override updateGraphicContext(canvas : ElementRef<HTMLCanvasElement>) {
    if (!canvas) return

    // @ts-ignore
    let context: CanvasRenderingContext2D = canvas.nativeElement.getContext('2d');

    let len = this._pcsDto.width

    canvas.nativeElement.width = len
    canvas.nativeElement.height = len // square

    this._clockDrawing = new ClockDrawing({
      ipcs: this._pcsDto.pcs,
      ctx: context,
      width: len,
      height: len, // square
      pc_pivot_color: 'red', // this._pcsDto.uiMusaic.pivotColor,
      pc_color_fill: this._pcsDto.uiClock.colorPitchOn,
      drawPivot: this._pcsDto.uiClock.drawPivot,
      segmentsLineDash: [[1, 2, 2, 1], [2, 3]] // median, inter
    })
  }

  override drawForm(pcsDto: UIPcsDto, canvas : ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this._pcsDto = pcsDto
    this.updateGraphicContext(canvas)
    this._clockDrawing.draw()
  }
}
