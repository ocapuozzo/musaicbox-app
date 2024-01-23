import {Component, ElementRef, ViewChild, AfterViewInit, Input} from '@angular/core';

@Component({
  selector: 'app-truc',
  standalone: true,
  // template: '<canvas #paintCanvas></canvas>',
  templateUrl: './truc.component.html',
  styleUrl: './truc.component.css',
  imports: [],
})
export class TrucComponent implements AfterViewInit {
  @ViewChild('paintCanvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

  @Input() trucColor : 'red';
  private context: CanvasRenderingContext2D;
  private isDrawing: boolean = false;

  ngAfterViewInit() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');
    this.setupCanvas();
  }

  private setupCanvas() {
    this.context.lineCap = 'round';
    this.context.lineWidth = 5;
    this.context.strokeStyle = 'black';

    this.canvas.nativeElement.addEventListener('mousedown', (event) => this.startDrawing(event));
    this.canvas.nativeElement.addEventListener('mousemove', (event) => this.draw(event));
    this.canvas.nativeElement.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.nativeElement.addEventListener('mouseleave', () => this.stopDrawing());
  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.draw(event); // To start drawing immediately from the initial point
  }

  private draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    this.context.beginPath();
    this.context.moveTo(event.clientX - this.canvas.nativeElement.offsetLeft, event.clientY - this.canvas.nativeElement.offsetTop);
    this.context.lineTo(event.clientX - this.canvas.nativeElement.offsetLeft, event.clientY - this.canvas.nativeElement.offsetTop);
    this.context.stroke();
  }

  private stopDrawing() {
    this.isDrawing = false;
  }
}
