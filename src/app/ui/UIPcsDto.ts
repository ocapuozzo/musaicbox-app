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
  position: { x: number; y: number }
  width: number
  height: number
  colorPitchOn : string = 'black'
  colorPitchOff : string = 'white'
  indexFormDrawer: number;
  isSelected: boolean;
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
    this.width = width ?? 100
    this.height = height ?? 100
    this.colorPitchOn = colorPitchOn ?? 'black' ;
    this.colorPitchOff = colorPitchOff ?? 'white';
    this.indexFormDrawer = indexFormDrawer ?? 0
    this.isSelected = isSelected ?? false
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
