import {IPcs} from "../core/IPcs";

export interface UIMusaic {
  rounded: boolean
  position : {x: number, y: number}
  drawGrid : boolean
  nbCellsPerLine : number
  nbCellsPerRow : number
  widthCell : number
  width: number
  height: number
}

export interface UIClock {
  drawPolygon : boolean
  radiusPitch : number
  textWidthAuto : boolean
  textWidth : number
  drawPivot : boolean
  colorPitchOn : string
  width: number
  height: number
}

export interface UIScore {
  height : number
}

export class UIPcsDto {
  static MUSAIC = 0
  static CLOCK = 1
  // TODO SCORE index...

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
      default :
        return this.uiMusaic.width
    }
  }
  set width(w) {
    switch (this.indexFormDrawer) {
      case UIPcsDto.MUSAIC :
        this.uiMusaic.width = w
        break
      case UIPcsDto.CLOCK :
        this.uiClock.width = w
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
    this.uiMusaic = uiMusaic ? {...uiMusaic} :  {
      position:{x:10, y:10},
      drawGrid: false,
      nbCellsPerLine:13,
      nbCellsPerRow:13,
      widthCell: 8,
      rounded: false,
      width: 104,
      height: 104
    }
    this.uiClock = uiClock ? { ...uiClock} : {
      textWidthAuto: true,
      textWidth: 10,
      radiusPitch : 10, // ? or auto
      drawPivot : true,
      drawPolygon : false,
      colorPitchOn : 'yellow',
      width: 104,
      height: 104
    }
    this.uiScore = uiScore ? {...uiScore} : {
      height : 25
    }

    // this.indexFormDrawer = UIPcsDto.MUSAIC
     this.uiMusaic.width = this.uiMusaic.widthCell * this.uiMusaic.nbCellsPerLine
     this.uiMusaic.height = this.uiMusaic.widthCell * this.uiMusaic.nbCellsPerRow
  } // constructor
}
