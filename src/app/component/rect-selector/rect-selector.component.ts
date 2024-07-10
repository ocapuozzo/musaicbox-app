import {Component, EventEmitter, OnInit, Output} from '@angular/core';

// from https://stackblitz.com/edit/basic-draw-app-gwube9

const MIN_WIDTH = 2
const MIN_HEIGHT = 6

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

  drawing = false;
  shape: Shape

  @Output() moving: EventEmitter<Shape> = new EventEmitter();

  constructor() {
    this.close()
  }

  ngOnInit() {

  }

  startDrawing(evt: MouseEvent) {
    // always show rectangle
    this.shape = {
      x: evt.offsetX - MIN_WIDTH,
      y: evt.offsetY - MIN_HEIGHT,
      w: MIN_WIDTH,
      h: MIN_HEIGHT,
    };

    this.drawing = true;
  }

  keepDrawing(evt: MouseEvent) {
    let draw = true
    if (this.drawing) {
      evt.preventDefault()
      evt.stopPropagation()
      // The SVG specification says that if width or height are negative then the rectangle is not drawn.
      // negative value causes errors
      if ((evt.offsetX - this.shape.x) > MIN_WIDTH) {
        this.shape.w = evt.offsetX - this.shape.x;
      } else if (evt.offsetX - MIN_WIDTH >= 0) {
        this.shape.x = evt.offsetX - MIN_WIDTH
      } else {
        draw = false
      }
      if ((evt.offsetY - this.shape.y) > MIN_HEIGHT) {
        this.shape.h = evt.offsetY - this.shape.y;
      } else if (evt.offsetY - MIN_WIDTH >= 0) {
        this.shape.y = evt.offsetY - MIN_HEIGHT
      } else {
        draw = false
      }

      if (draw) {
        // evt.preventDefault()
        // evt.stopPropagation()
        this.moving.emit(this.shape)
      }
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
