import {IPcs} from "../core/IPcs";

export class UIMusaic {
  rounded: boolean
  position : {x: number, y: number}
  opaque : boolean
  nbCellsPerLine : number
  nbCellsPerRow : number
  widthCell : number
  width: number
  height: number

  constructor(
    {rounded, /*position,*/ opaque, nbCellsPerLine, nbCellsPerRow, widthCell, width, height}:
      { rounded ?: boolean,
        // position ?: {x: number; y: number},
        opaque ?: boolean,
        nbCellsPerLine ?: number,
        nbCellsPerRow ?: number,
        widthCell ?: number,
        width ?: number,
        height ?: number}={})
  {
    this.rounded = rounded ?? false;
    // this.position = position ?? {x:10, y:10};
    this.opaque = opaque ?? true;
    this.nbCellsPerLine = nbCellsPerLine ?? 13;
    this.nbCellsPerRow = nbCellsPerRow ?? 13;
    this.widthCell = widthCell ?? 7;
    this.width = width ?? 88;
    this.height = height ?? 88;
  }
}

export class UIClock {
  drawPolygon : boolean
  radiusPitch : number
  textWidthAuto : boolean
  textWidth : number
  drawPivot : boolean
  colorPitchOn : string
  width: number
  height: number

  constructor(
    {drawPolygon, radiusPitch, textWidthAuto, textWidth, drawPivot, colorPitchOn, width, height}:
    { drawPolygon?:  boolean,
      colorPitchOn?: string,
      width?: number,
      height?: number,
      radiusPitch ?: number,
      textWidthAuto ?: boolean,
      textWidth ?: number,
      drawPivot ?: boolean
    }={}) {
    this.drawPolygon = drawPolygon ?? false;
    this.radiusPitch = radiusPitch ?? 10;
    this.textWidthAuto = textWidthAuto ?? true;
    this.textWidth = textWidth ?? 10;
    this.drawPivot = drawPivot ?? true;
    this.colorPitchOn = colorPitchOn ?? 'yellow';
    this.width = width ?? 91;
    this.height = height ?? 91;
  }
}

export class UIScore {
  width: number
  height : number
  constructor({width, height}:{width ?: number, height ?: number}={})  {
    this.width = width ?? 80;
    this.height = height ?? 30;
  }
}

export class UIPcsDto {
  static MUSAIC = 0
  static CLOCK = 1
  static SCORE = 2
  // TODO others index...

  id : string
  pcs : IPcs = new IPcs({strPcs:"0, 4, 8"})
  position: { x: number; y: number }
  colorPitchOn : string = 'black'
  colorPitchOff : string = 'white'
  indexFormDrawer: number;
  isSelected: boolean;
  uiMusaic : UIMusaic;
  uiClock : UIClock;
  uiScore : UIScore;
  // polymorphism width and height
  // in differance of extends class, here a component see all data
  // usefully, by example, to doZoom service
  get width() {
    switch (this.indexFormDrawer) {
      case UIPcsDto.MUSAIC :
        return this.uiMusaic.width
      case UIPcsDto.CLOCK :
        return this.uiClock.width
      case UIPcsDto.SCORE :
        return this.uiScore.width
      default :
        return this.uiMusaic.width
    }
  }
  set width(w: number) {
    switch (this.indexFormDrawer) {
      case UIPcsDto.MUSAIC :
        this.uiMusaic.width = w
        break
      case UIPcsDto.CLOCK :
        this.uiClock.width = w
        break
      case UIPcsDto.SCORE :
        this.uiScore.width = w
        break
      default :
        this.uiMusaic.width = w
    }
  }
    get height() {
      switch (this.indexFormDrawer) {
        case UIPcsDto.MUSAIC :
          return this.uiMusaic.height
        case UIPcsDto.CLOCK :
          return this.uiClock.height
        case UIPcsDto.SCORE :
          return this.uiScore.height
        default :
          return this.uiMusaic.height
      }
    }
    set height(h) {
      switch (this.indexFormDrawer) {
        case UIPcsDto.MUSAIC :
          this.uiMusaic.height = h
          break
        case UIPcsDto.CLOCK :
          this.uiClock.height = h
          break
        case UIPcsDto.SCORE :
          this.uiScore.height = h
          break
        default :
          this.uiMusaic.height = h
      }
  }

  constructor(
    {pcs, position, width, height, colorPitchOn, colorPitchOff, indexFormDrawer, isSelected, uiMusaic, uiClock, uiScore} : {
      // id : string,
      pcs ?: IPcs, //new IPcs({strPcs:"0, 4, 8"}),
      position ?: {x:number, y:number},
      width ?: number,
      height ?: number,
      colorPitchOn ?: string,
      colorPitchOff ?: string,
      indexFormDrawer ?: number,
      isSelected ?: boolean,
      uiMusaic ?: UIMusaic,
      uiClock ?: UIClock,
      uiScore ?: UIScore
    }= {}
    ) {

    this.pcs = pcs ?? new IPcs({strPcs:"0, 4, 8"});
    this.id = this.pcs.id.toString() + new Date().valueOf().toString(10);
    this.position = position ?? {x:50, y:50}
    this.colorPitchOn = colorPitchOn ?? 'black' ;
    this.colorPitchOff = colorPitchOff ?? 'white';
    this.indexFormDrawer = indexFormDrawer ?? 0
    this.isSelected = isSelected ?? false
    this.uiMusaic = uiMusaic ? {... uiMusaic} : new UIMusaic()
    this.uiClock = uiClock ? {...uiClock} : new UIClock()
    this.uiScore = uiScore ? {...uiScore} : {
      height : 70,
      width: 104
    }

    // this.indexFormDrawer = UIPcsDto.MUSAIC
     this.uiMusaic.width = this.uiMusaic.widthCell * this.uiMusaic.nbCellsPerLine
     this.uiMusaic.height = this.uiMusaic.widthCell * this.uiMusaic.nbCellsPerRow
  } // constructor
}
