import {Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
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
  // @ViewChild('containercanvas', {static: false}) containerCanvas: ElementRef<HTMLCanvasElement>;

  @Input() ipcs : IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() pivotColor = 'red'
  private context: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private clockDrawing : ClockDrawing;

  @Input() pcColorSet = 'yellow'
  @Input() drawPivot = false

  savDimension : { width :number } = {width:0}

  n: 0;

  // test https://stackblitz.com/edit/angular-resize-observer-example?file=src%2Fapp%2Fapp.module.ts
  observer : ResizeObserver
  width : number

  // TODO check if necessary
  size : 0;

  ngAfterViewInit() {
    // this.updateGraphicContext();
    this.setupEvents();
    // this.canvas.nativeElement.style.width = "100%";
    // this.canvas.nativeElement.style.height = "100%";
    // this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
    // this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
    this.draw();
  }

  ngOnInit() {

  }

  private updateGraphicContext() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let len = Math.min(
      this.canvas.nativeElement?.parentElement?.offsetWidth ?? 100, // offsetWidth ?
      this.canvas.nativeElement?.parentElement?.offsetHeight ?? 100) // square

    // console.log("parent size offset width = "+ this.canvas.nativeElement?.parentElement?.offsetWidth ?? 100)
    // console.log("parent size offset height = "+ this.canvas.nativeElement?.parentElement?.offsetHeight ?? 100)
    // console.log("parent size width = "+ this.canvas.nativeElement?.parentElement?.clientWidth ?? 100)
    // console.log("parent size height = "+ this.canvas.nativeElement?.parentElement?.clientHeight ?? 100)
    //
    // console.log("len = "+ len)

    // len = len * .9
    if (this.savDimension.width !== len) {
      this.savDimension.width = len
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
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    console.log("resize")
    this.draw();
    // this.doUpdateGraphics()
  }

  //
  // doUpdateGraphics() {
  //   this.updateGraphicContext()
  //   // and more...
  // }

  private setupEvents(): void {
  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.draw(); // To start drawing immediately from the initial point
  }

  checkClockDrawing() {
    if (!this.clockDrawing) {
      let len = Math.min(this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight)
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
    // this.checkClockDrawing()
    console.log("draw()")
    this.updateGraphicContext()
    this.clockDrawing.draw()
  }

  private stopDrawing() {
    this.isDrawing = false;
  }
}
