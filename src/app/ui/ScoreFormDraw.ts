import {UIPcsDto} from "./UIPcsDto";
import {ElementRef} from "@angular/core";
import {FormDraw} from "./FormDraw";
import {ScoreDrawing} from "./ScoreDrawing";

export class ScoreFormDraw extends FormDraw {
  private _scoreDrawing: ScoreDrawing;
  idElement : string

  constructor(idElement : string) {
    super();
    this.idElement = idElement
  }

  override updateGraphicContext(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    // if (!canvas) return

    let elt = document.getElementById('paper-'+this.idElement) as HTMLElement

    // // @ts-ignore
    // // let context: CanvasRenderingContext2D = canvas.nativeElement.getContext('2d');
    // let context: CanvasRenderingContext2D = countenairCanvas.getContext('2d');

    // canvas.nativeElement.width = pcsDto.width
    // canvas.nativeElement.height = pcsDto.height
    //
    // elt.style.width = pcsDto.width + 'px'
    // elt.style.height = pcsDto.height + 'px'
    //
    // countenairCanvas.width=pcsDto.width
    // countenairCanvas.height= pcsDto.height


    this._scoreDrawing = new ScoreDrawing({
      idElement : this.idElement,
      pcsDto: pcsDto
      // ctx: context
    })
  }

  override drawForm(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    // if (!canvas) return
    this.updateGraphicContext(pcsDto, canvas)
    this._scoreDrawing.drawScore()
  }
}
