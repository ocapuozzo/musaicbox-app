import {IPcs} from "../core/IPcs";

export interface UIMusaic {
  rounded: boolean
  position : {x: number, y: number}
  drawGrid : boolean
  nbCellsPerLine : number
  nbCellsPerRow : number
  widthCell : number | undefined
}

export interface UIClock {
  drawPolygon : boolean
  radiusPitch : number
  textWidthAuto : boolean
  textWidth : number
  drawPivot : boolean
  colorPitchOn : string
}

export interface UIScore {
  height : number
}

export class UIPcsDto {
  id : string
  pcs : IPcs = new IPcs({strPcs:"0, 4, 8"})
  width: number
  height: number
  public colorPitchOn : string = 'black'
  colorPitchOff : string = 'white'
  public uiMusaic : UIMusaic = {
    position:{x:10, y:10},
    drawGrid: false,
    nbCellsPerLine:13,
    nbCellsPerRow:13,
    widthCell: undefined,
    rounded:false
  }
  uiClock : UIClock = {
    textWidthAuto: true,
    textWidth: 10,
    radiusPitch : 10, // ? or auto
    drawPivot : true,
    drawPolygon : false,
    colorPitchOn : 'yellow'
  }
  uiScore : UIScore = {
    height : 25
  }

  constructor(
    {pcs, width, height, colorPitchOn, colorPitchOff, uiMusaic, uiClock, uiScore} : {
      // id : string,
      pcs ?: IPcs, //new IPcs({strPcs:"0, 4, 8"}),
      width ?: number,
      height ?: number,
      colorPitchOn ?: string,
      colorPitchOff ?: string,
      uiMusaic ?: UIMusaic,
      uiClock ?: UIClock,
      uiScore ?: UIScore
    }= {}
    ) {

    this.pcs = pcs ?? new IPcs({strPcs:"0, 4, 8"});
    this.id = this.pcs.id.toString() + new Date().valueOf().toString(10);
    this.width = width ?? 100
    this.height = height ?? 100
    this.colorPitchOn = colorPitchOn ?? 'black' ;
    this.colorPitchOff = colorPitchOff ?? 'white';
    this.uiMusaic = uiMusaic ?? {
      position:{x:10, y:10},
      drawGrid: false,
      nbCellsPerLine:13,
      nbCellsPerRow:13,
      widthCell: undefined,
      rounded: false
    }
    this.uiClock = uiClock ?? {
      textWidthAuto: true,
      textWidth: 10,
      radiusPitch : 10, // ? or auto
      drawPivot : true,
      drawPolygon : false,
      colorPitchOn : 'yellow'
    }
    this.uiScore = uiScore ?? {
      height : 25
    }
  }
}
