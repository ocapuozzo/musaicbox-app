import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ClockDrawing} from "../../ui/ClockDrawing";
import {IPcs} from "../../core/IPcs";

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.css'
})
export class ClockComponent {
  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('containercanvas', {static: false}) containerCanvas: ElementRef<HTMLCanvasElement>;

  @Input() ipcs : IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() pivotColor = 'red'
  private context: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private clockDrawing : ClockDrawing;

  @Input() pcColorSet = 'yellow'
  @Input() drawPivot = false

  n: 0;

  // TODO check if necessary
  size : 0;

  ngAfterViewInit() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let len = Math.min(this.containerCanvas.nativeElement.clientWidth, this.containerCanvas.nativeElement.clientHeight)

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
    this.setupEvents();
    this.draw();
  }


  private setupEvents(): void {
  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.draw(); // To start drawing immediately from the initial point
  }

  checkClockDrawing() {
    if (!this.clockDrawing) {
      let len = Math.min(this.containerCanvas.nativeElement.clientWidth, this.containerCanvas.nativeElement.clientHeight)
      this.clockDrawing = new ClockDrawing(
        {
          ipcs: this.ipcs,
          ctx: this.context,
          width: len,
          height: len,
          pc_color_fill: "yellow",
          segmentsLineDash: [[1, 2, 2, 1], [2, 3]] // median, inter
        })
    }
  }
  private draw(): void {
    this.checkClockDrawing()
    this.clockDrawing.draw()
  }

  private stopDrawing() {
    this.isDrawing = false;
  }
}
