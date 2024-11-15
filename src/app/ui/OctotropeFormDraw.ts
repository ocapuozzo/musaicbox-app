import {UIPcsDto} from "./UIPcsDto";
import {ElementRef} from "@angular/core";
import {FormDraw} from "./FormDraw";
import {OctotropeDrawing} from "./OctotropeDrawing";

export class OctotropeFormDraw extends FormDraw {
  _octotropeDrawing: OctotropeDrawing

  constructor() {
    super();
  }

  override updateGraphicContext(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    // @ts-ignore
    let context: CanvasRenderingContext2D = canvas.nativeElement.getContext('2d');
    canvas.nativeElement.width = pcsDto.width
    canvas.nativeElement.height = pcsDto.height

    this._octotropeDrawing = new OctotropeDrawing({pcsDto: pcsDto, ctx: context})
  }

  override drawForm(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this.updateGraphicContext(pcsDto, canvas)
    this._octotropeDrawing.drawOctotrope()
  }
}
