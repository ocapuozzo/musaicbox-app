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
    this._musaicDrawing = new MusaicDrawing({pcsDto: pcsDto, ctx: context})
  }

  override drawForm(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this.updateGraphicContext(pcsDto, canvas)
    this._musaicDrawing.drawMusaic()
  }
}
