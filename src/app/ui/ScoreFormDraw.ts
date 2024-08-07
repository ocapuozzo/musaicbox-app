import {UIPcsDto} from "./UIPcsDto";
import {ElementRef} from "@angular/core";
import {FormDraw} from "./FormDraw";
import {ScoreDrawingAbcNotation} from "./ScoreDrawingAbcNotation";

export class ScoreFormDraw extends FormDraw {
  private _scoreDrawing: ScoreDrawingAbcNotation;
  idElement : string

  constructor(idElement : string) {
    super();
    this.idElement = idElement
  }

  override updateGraphicContext(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    this._scoreDrawing = new ScoreDrawingAbcNotation({
      idElement : this.idElement,
      pcsDto: pcsDto
    })
  }

  override drawForm(pcsDto: UIPcsDto, canvas: ElementRef<HTMLCanvasElement>) {
    this.updateGraphicContext(pcsDto, canvas)
    this._scoreDrawing.drawScore()
  }
}
