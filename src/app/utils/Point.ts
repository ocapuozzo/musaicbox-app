/*
 * Copyright (c) 2019. Olivier Capuozzo
 */

export class Point {
  x:number
  y:number
  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }

  isIncludeIn(rect: DOMRect) {
     return rect.x <= this.x && this.x <= rect.x + rect.width &&
        rect.y <= this.y && this.y <= rect.y + rect.height;
    }
}

