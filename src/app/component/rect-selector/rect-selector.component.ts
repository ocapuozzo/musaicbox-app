import {Component, EventEmitter, OnInit, Output} from '@angular/core';

// from https://stackblitz.com/edit/basic-draw-app-gwube9

const MIN_WIDTH = 0
const MIN_HEIGHT = 0

export class Shape {
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

  canDraw = false;
  shape: Shape
  startX: number
  startY: number

  @Output() moving: EventEmitter<Shape> = new EventEmitter();

  constructor() {
    this.close()
  }

  ngOnInit() {
  }

  startDrawing(evt: MouseEvent) {
    // always show rectangle
    this.startX = evt.offsetX
    this.startY = evt.offsetY

    this.shape = {
      x:  this.startX - MIN_WIDTH,
      y:  this.startY - MIN_HEIGHT,
      w: MIN_WIDTH,
      h: MIN_HEIGHT,
    };

    this.canDraw = true;
  }

  drawing(evt: MouseEvent) {
    if (this.canDraw) {
      evt.preventDefault()
      evt.stopPropagation()
      // The SVG specification says that if width or height are negative then the rectangle is not drawn.
      // negative value causes errors. Solution is to add start X & Y variables and commute with shape.x & y
      if (evt.offsetX >= this.startX) {
        // mouse position.x is right
        this.shape.x = this.startX
        this.shape.w = evt.offsetX - this.startX;
      } else {
        // now mouse position.x is left
        this.shape.x = evt.offsetX
        this.shape.w = this.startX - evt.offsetX;
      }
      if (evt.offsetY >= this.startY) {
        // mouse position.y is bottom
        this.shape.y = this.startY
        this.shape.h = evt.offsetY - this.startY;
      } else {
        // now mouse position.y is top
        this.shape.y = evt.offsetY
        this.shape.h = this.startY - evt.offsetY;
      }
      this.moving.emit(this.shape)
    }
  }

  stopDrawing(evt: MouseEvent) {
    this.canDraw = false;
    this.close()
  }

  close() {
    this.startX = 0
    this.startY = 0
    this.shape = {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };
  }

}
