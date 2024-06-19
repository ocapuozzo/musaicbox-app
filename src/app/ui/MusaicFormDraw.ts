import {MusaicDrawing} from "./MusaicDrawing";
import {UIPcsDto} from "./UIPcsDto";
import {ElementRef} from "@angular/core";
import {FormDraw} from "./FormDraw";

export class MusaicFormDraw extends FormDraw {
  _musaicDrawing: MusaicDrawing

  constructor() {
    super();
  }

  override updateGraphicContext(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return

    // @ts-ignore
    let context: CanvasRenderingContext2D = canvas.nativeElement.getContext('2d');

    let n = pcsDto.pcs.nMapping //getMappedBinPcs().length;
    let CEL_WIDTH = Math.floor(pcsDto.width / (n + 1));

    // avoid that this.CEL_WIDTH * (n + 1) > width,
    // is not always case ! TODO generalize with nbCellsPer line/row - not n based
    if (CEL_WIDTH * (n + 1) > pcsDto.width) {//this._preferredWidthInput) {
      CEL_WIDTH = CEL_WIDTH - 1
    }

    // adjust canvas size from CEL_WIDTH
    let preferredWidth = CEL_WIDTH * (n + 1)
    canvas.nativeElement.width = preferredWidth
    canvas.nativeElement.height = preferredWidth  // square

    pcsDto.uiMusaic.widthCell = CEL_WIDTH

    let newPcsDtp =
      new UIPcsDto({...pcsDto})

    this._musaicDrawing = new MusaicDrawing({pcsDto: newPcsDtp, ctx: context})
  }

  override drawForm(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this.updateGraphicContext(pcsDto, canvas)
    this._musaicDrawing.drawMusaic()
  }
}
