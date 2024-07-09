import {Component, EventEmitter, OnInit, Output} from '@angular/core';

// from https://stackblitz.com/edit/basic-draw-app-gwube9

const MIN_WIDTH = 2

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
      y: evt.offsetY - MIN_WIDTH,
      w: MIN_WIDTH,
      h: MIN_WIDTH,
    };

    this.drawing = true;
  }

  keepDrawing(evt: MouseEvent) {
    if (this.drawing) {
      // The SVG specification says that if width or height are negative then the rectangle is not drawn.
      // negative value causes errors
      if ((evt.offsetX - this.shape.x) > MIN_WIDTH) {
        this.shape.w = evt.offsetX - this.shape.x;
      } else {
        this.shape.x = evt.offsetX - MIN_WIDTH
      }
      if ((evt.offsetY - this.shape.y) > MIN_WIDTH) {
        this.shape.h = evt.offsetY - this.shape.y;
      } else {
        this.shape.y = evt.offsetY - MIN_WIDTH
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
