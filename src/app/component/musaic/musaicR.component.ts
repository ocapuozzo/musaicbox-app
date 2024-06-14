import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {NgClass} from "@angular/common";
import {UIPcsDto} from "../../ui/UIPcsDto";
import {MusaicDrawing} from "../../ui/MusaicDrawing";

@Component({
  selector: 'app-musaic-r',
  standalone: true,
  imports: [
    NgClass
  ],
  template: '<canvas #canvas id="canvas" [ngClass]="{\'roundedImageBorder roundedImageShadow\': rounded, \'musaic\': true}"></canvas>',
  styleUrl: './musaic.component.css'
})
export class MusaicRComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D;
  private musaicDrawing : MusaicDrawing

  // private CEL_WIDTH: number

  _pcsDto = new UIPcsDto({colorPitchOff: 'white', colorPitchOn:'black'})
  _preferredWidthInput = 150

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
    this._preferredWidthInput = this._pcsDto.width
    this.updateGraphicContext()
    this.drawsMusaic();
  }

// ngOnInit() {}

  ngAfterViewInit() {
    this.updateGraphicContext()
    this.drawsMusaic();
  }

  // design Interface/classe IFormDraw with updateGraphicContext() and drawForm() (which call updateGraphicContext ?) and begin by make MusaicForm and ClockForm

  private updateGraphicContext() {
    if (!this.canvas) return

    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let n = this.ipcs.nMapping //getMappedBinPcs().length;

    let CEL_WIDTH = Math.floor((this._preferredWidthInput / (n + 1)));

    // avoid that this.CEL_WIDTH * (n + 1) > width,
    // is not always case ! TODO generalize with nbCellsPer line/row - not n based
    if (CEL_WIDTH * (n + 1) > this._pcsDto.width) {//this._preferredWidthInput) {
      CEL_WIDTH = CEL_WIDTH - 1
    }

    // adjust canvas size from CEL_WIDTH
    this._preferredWidthInput = CEL_WIDTH * (n + 1)
    this.canvas.nativeElement.width = this._preferredWidthInput
    this.canvas.nativeElement.height = this._preferredWidthInput  // square

    this._pcsDto.uiMusaic.widthCell = CEL_WIDTH

    // let newPcsDtp = new UIPcsDto({...this._pcsDto})
    let newPcsDtp =
      new UIPcsDto({...this._pcsDto})

    // update this property throws ExpressionChangedAfterItHasBeenCheckedError
    // newPcsDtp.uiMusaic.width = this._preferredWidthInput

    this._pcsDto = newPcsDtp
    this.musaicDrawing = new MusaicDrawing({pcsDto:newPcsDtp, ctx:this.context})
  }

  drawsMusaic() {
    if (!this.musaicDrawing) return
    this.musaicDrawing.drawMusaic()
  }

}
