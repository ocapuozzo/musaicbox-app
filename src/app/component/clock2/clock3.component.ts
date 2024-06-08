import {Component, ElementRef, Input, ViewChild} from "@angular/core";
import {IPcs} from "../../core/IPcs";
import {ClockDrawing} from "../../ui/ClockDrawing";

@Component({
  selector: 'app-clock3',
  standalone: true,
  imports: [],
  template: '<canvas #canvas></canvas>',
  styleUrl: './clock3.component.css'
})
export class Clock3Component {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  @Input() ipcs: IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() pivotColor = 'red'

  private _canvasWidth = 40

  get w() {
    return this._canvasWidth
    // return this.canvas.nativeElement.width
  }
  @Input() set w(value: number) {
    this._canvasWidth = value
    if (this.canvas) {
       this.canvas.nativeElement.width = value
       this.canvas.nativeElement.height = value //square
       this.draw();
    }
  }

  private context: CanvasRenderingContext2D;
  private clockDrawing: ClockDrawing;

  @Input() pcColorSet = 'yellow'
  @Input() drawPivot = false

  ngAfterViewInit() {
    this.setupEvents();
    this.draw();
  }

  ngOnInit() {
  }

  private updateGraphicContext() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let len = this.w

    console.log("(clock3) len : " + len)
    this.canvas.nativeElement.width = len
    this.canvas.nativeElement.height = len // square

    this.clockDrawing = new ClockDrawing({
      ipcs: this.ipcs,
      ctx: this.context,
      width: len,
      height: len, // square
      pc_pivot_color: this.pivotColor,
      pc_color_fill: this.pcColorSet,
      drawPivot: this.drawPivot,
      segmentsLineDash: [[1, 2, 2, 1], [2, 3]] // median, inter
    })
  }

  private setupEvents(): void {
  }

  private draw(): void {
    // console.log("draw()")
    this.updateGraphicContext()
    this.clockDrawing.draw()
  }

}
