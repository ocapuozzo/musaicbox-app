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
  @Input() ipcs : IPcs = new IPcs({strPcs: "0,3,6,9"})
  private context: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private clockDrawing : ClockDrawing;

  n: 0;

  // TODO check if necessary
  size : 0;

  ngAfterViewInit() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let len = this.size ? this.size : Math.min(this.context.canvas.clientWidth, this.context.canvas.clientHeight)
    this.clockDrawing = new ClockDrawing( {
      ipcs: this.ipcs,
      ctx: this.context,
      width: len,
      height: len + (0), // square
      pc_color : "yellow",
      segmentsLineDash : [ [1, 2, 2, 1], [2, 3] ] // median, inter
    })

    this.setupEvents();
    this.draw();
  }

  private setupEvents(): void {
    // this.canvas.nativeElement.addEventListener('mousedown', (event) => this.startDrawing(event));
    // this.canvas.nativeElement.addEventListener('mousemove', (event) => this.draw(event));
    // this.canvas.nativeElement.addEventListener('mouseup', () => this.stopDrawing());
    // this.canvas.nativeElement.addEventListener('mouseleave', () => this.stopDrawing());
  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.draw(); // To start drawing immediately from the initial point
  }

  private draw(): void {
    let len = this.size ? this.size : Math.min(this.context.canvas.clientWidth, this.context.canvas.clientHeight)
    //  console.log("len draw: " + len)

    this.clockDrawing.width = len
    this.clockDrawing.height = len
    // this.$refs['canvas'].width = len
    // this.$refs['canvas'].height = len
    this.canvas.nativeElement.width = len
    this.canvas.nativeElement.height = len
    this.clockDrawing.draw()

  }

  private stopDrawing() {
    this.isDrawing = false;
  }
}
