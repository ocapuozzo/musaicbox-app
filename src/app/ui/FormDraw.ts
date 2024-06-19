import {UIPcsDto} from "./UIPcsDto";
import {ElementRef} from "@angular/core";

export abstract class FormDraw {
  public abstract updateGraphicContext(pcsDto: UIPcsDto, canvas : ElementRef<HTMLCanvasElement>) : void // {}
  public abstract drawForm(pcsDto: UIPcsDto, canvas : ElementRef<HTMLCanvasElement>): void
}

