import {Component, ElementRef, Input, ViewChild} from "@angular/core";
import {IPcs} from "../../core/IPcs";
import {ClockDrawing} from "../../ui/ClockDrawing";

@Component({
  selector: 'app-clock2',
  standalone: true,
  imports: [],
  template: '<canvas #canvas></canvas>',
  styleUrl: './clock2.component.css'
})
export class Clock2Component {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  @Input() ipcs: IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() pivotColor = 'red'

  @Input() get w() {
    return this.canvas.nativeElement.width
  }

  set w(value: number) {
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
    // this.updateGraphicContext();
    this.setupEvents();
    this.canvas.nativeElement.style.width = "100%";
    // this.canvas.nativeElement.style.height = "100%"; // height may be more than width

    this.canvas.nativeElement.width =  this.canvas.nativeElement.offsetWidth;
    this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
    this.draw();
  }

  ngOnInit() {

  }

  private updateGraphicContext() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let len = Math.min(
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height)

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
