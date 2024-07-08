import {Component, EventEmitter, OnInit, Output} from '@angular/core';

// from https://stackblitz.com/edit/basic-draw-app-gwube9

export class Shape {
  // type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

@Component({
  selector: 'app-rect-selector',
  standalone: true,
  imports: [],
  templateUrl: './rect-selector.component.html',
  styleUrl: './rect-selector.component.css'
})
export class RectSelectorComponent implements OnInit {

  drawing = false;
  shape: Shape
  oldX: number = 0

  @Output() moving: EventEmitter<Shape> = new EventEmitter();

  constructor() {
    this.close()
  }

  ngOnInit() {

  }

  startDrawing(evt: MouseEvent) {
    if (
      this.shape &&
      evt.offsetX >= this.shape.x &&
      evt.offsetX <= this.shape.x + this.shape.w &&
      evt.offsetY >= this.shape.y &&
      evt.offsetY <= this.shape.y + this.shape.h
    ) {
      this.shape = {
        x: this.shape.x,
        y: this.shape.y,
        w: 0,
        h: 0,
      };
    } else {
      this.shape = {
        x: evt.offsetX,
        y: evt.offsetY,
        w: 0,
        h: 0,
      };
    }

    this.drawing = true;

  }

  keepDrawing(evt: MouseEvent) {
    if (this.drawing) {
      // The SVG specification says that if width or height are negative then the rectangle is not drawn.
      // negative value causes errors
      if ((evt.offsetX - this.shape.x) >= 0) {
        this.shape.w = evt.offsetX - this.shape.x;
        this.oldX = 0
      } else {
        if (this.oldX === 0) {
          this.oldX = this.shape.x
        }
        this.shape.x = evt.offsetX
      }
      if ((evt.offsetY - this.shape.y) >= 0) {
        this.shape.h = evt.offsetY - this.shape.y;
      } else {
        this.shape.y = evt.offsetY
      }
      evt.preventDefault()
      evt.stopPropagation()
      this.moving.emit(this.shape)
    }
  }

  stopDrawing(evt: MouseEvent) {
    this.drawing = false;
    this.close()
  }

  close() {
    this.shape = {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };

  }
}
