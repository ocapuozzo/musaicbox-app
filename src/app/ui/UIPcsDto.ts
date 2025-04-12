import {IPcs} from "../core/IPcs";

export const Transformation = ['ID', 'M5', 'M7', 'M11'] as const;
export type TypeTransformation = typeof Transformation[number];


export interface IFreeText {
  text:string
  width:number
  height:number
  fontSize:string
}

export class UIMusaic {
  rounded: boolean
  position: { x: number, y: number }
  opaque: boolean
  nbCellsPerLine: number
  nbCellsPerRow: number
  widthCell: number
  width: number
  height: number

  constructor(
    {rounded, /*position,*/ opaque, nbCellsPerLine, nbCellsPerRow, widthCell, width, height}:
      {
        rounded?: boolean,
        // position ?: {x: number; y: number},
        opaque?: boolean,
        nbCellsPerLine?: number,
        nbCellsPerRow?: number,
        widthCell?: number,
        width?: number,
        height?: number
      } = {}) {
    this.rounded = rounded ?? false;
    // this.position = position ?? {x:10, y:10};
    this.opaque = opaque ?? true;
    this.nbCellsPerLine = nbCellsPerLine ?? 13;
    this.nbCellsPerRow = nbCellsPerRow ?? 13;
    this.widthCell = widthCell ?? 7;   // 13, 7 and 91 match together
    this.width = width ?? 91;
    this.height = height ?? 91;
  }
}

export class UIClock {
  drawPolygon: boolean
  radiusPitch: number
  textWidthAuto: boolean
  textWidth: number
  // drawPivot: boolean
  colorPitchOn: string
  width: number
  height: number

  constructor(
    {drawPolygon, radiusPitch, textWidthAuto, textWidth, /*drawPivot,*/ colorPitchOn, width, height}:
      {
        drawPolygon?: boolean,
        colorPitchOn?: string,
        width?: number,
        height?: number,
        radiusPitch?: number,
        textWidthAuto?: boolean,
        textWidth?: number,
        // drawPivot?: boolean
      } = {}) {
    this.drawPolygon = drawPolygon ?? false;
    this.radiusPitch = radiusPitch ?? 10;
    this.textWidthAuto = textWidthAuto ?? true;
    this.textWidth = textWidth ?? 10;
    // this.drawPivot = drawPivot ?? true;
    this.colorPitchOn = colorPitchOn ?? 'yellow';
    this.width = width ?? 91;
    this.height = height ?? 91;
  }
}

export class UIScore {
  width: number
  height: number

  constructor({width, height}: { width?: number, height?: number } = {}) {
    this.width = width ?? 130;
    this.height = height ?? 76;
  }
}

// main class
export const DRAWER_NAMES = ['Musaic', 'Clock', 'Score', 'Octotrope', 'FreeText'] as const;
export type TDrawerName = typeof DRAWER_NAMES[number];

export class UIPcsDto {
  static MUSAIC = 0
  static CLOCK = 1
  static SCORE = 2
  static OCTOTROPE = 13
  static FREE_TEXT = 42

  static  ALL_DRAWERS : Map<TDrawerName,number> = new Map( [
      ["Musaic", UIPcsDto.MUSAIC],
      ["Clock", UIPcsDto.CLOCK],
      ["Score",UIPcsDto.SCORE],
      ["Octotrope", UIPcsDto.OCTOTROPE],
      ["FreeText",UIPcsDto.FREE_TEXT]
    ]
  )

  id: string
  freeText : IFreeText
  // pcs will not be serialized (transient)
  pcs: IPcs = new IPcs({strPcs: "0, 4, 8"})

  currentCSSAnimationTransformationState : string /*TypeTransformation*/ = "ID"

  position: { x: number; y: number }
  colorPitchOn: string = 'black'
  colorPitchOff: string = 'white'
  indexFormDrawer: number
  isSelected: boolean

  // xor value when true
  showName: boolean
  showPcs: boolean
  showPivot: boolean

  uiMusaic: UIMusaic
  uiClock: UIClock
  uiScore: UIScore
  octotrope: { size: number }

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
      case UIPcsDto.FREE_TEXT :
        return this.freeText.width
      case UIPcsDto.OCTOTROPE :
        return this.octotrope.size
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
      case UIPcsDto.FREE_TEXT :
        this.freeText.width = w
        break
      case UIPcsDto.OCTOTROPE :
        this.octotrope.size = w
        break
      default :
        this.uiMusaic.width = w
    }
  }

  get height() {
    let h : number
    switch (this.indexFormDrawer) {
      case UIPcsDto.MUSAIC :
        h = this.uiMusaic.height
        break
      case UIPcsDto.CLOCK :
        // if (this.showName) return this.uiClock.height + 16
        h = this.uiClock.height
        break
      case UIPcsDto.SCORE :
        h = this.uiScore.height - 10 // difficult to set good height
        break
      case UIPcsDto.FREE_TEXT :
        h = this.freeText.height
        break
      case UIPcsDto.OCTOTROPE :
        h = this.octotrope.size
        break
      default :
        h =  this.uiMusaic.height
    }
    return h
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
      case UIPcsDto.OCTOTROPE :
        this.octotrope.size = h
        break
      case UIPcsDto.FREE_TEXT :
        // this.freeText.height = h
        this.freeText.height = this.freeText.text.split("\n").length*(parseInt(this.freeText.fontSize)+10)
        // bypass, always computed (see doUpdateFreeText() of manager-page-wb-service )
        //
        break
      default :
        this.uiMusaic.height = h
    }
  }

  constructor(
    {
      pcs,
      freeText,
      // serializedPcs,
      position,
      colorPitchOn,
      colorPitchOff,
      indexFormDrawer,
      isSelected,
      showName,
      showPcs,
      showPivot,
      octotrope,
      uiMusaic,
      uiClock,
      uiScore
    }: {
      // id : string,
      pcs?: IPcs, //new IPcs({strPcs:"0, 4, 8"}),
      freeText ?: IFreeText,
      // serializedPcs?: ISerializedPcs,
      position?: { x: number, y: number },
      colorPitchOn?: string,
      colorPitchOff?: string,
      indexFormDrawer?: number,
      isSelected?: boolean,
      showName?: boolean,
      showPcs?: boolean,
      showPivot?: boolean,
      octotrope ?: { size: number },
      uiMusaic?: UIMusaic,
      uiClock?: UIClock,
      uiScore?: UIScore
    } = {}
  ) {

    // this.serializedPcs = serializedPcs ?? {pcsStr: '', iPivot: 0, groupName:'', nMapping:12}
    this.pcs = pcs
      ? pcs
//      : this.serializedPcs.pcsStr ? new IPcs({strPcs: this.serializedPcs.pcsStr, iPivot: this.serializedPcs.iPivot})
        : new IPcs({strPcs: "0, 4, 8"});

    // // duplicate with manager local storage service line 107
    // // see if this code is dead or not
    // if (this.serializedPcs.groupName) {
    //   const groupAction = ManagerGroupActionService.getGroupActionFromGroupName(this.serializedPcs.groupName)
    //   if (groupAction) {
    //     const savPivot = this.pcs.getPivot()
    //     this.pcs = ManagerPcsService.makeNewInstanceOf(this.pcs, groupAction, savPivot);
    //   }
    // }
    this.id = this.pcs.id.toString() + new Date().valueOf().toString(10);

    if (freeText === undefined) {
      const pcsMap12 = this.pcs.unMap()
      this.freeText = {
        text: pcsMap12.getPcsStr(),
        width: pcsMap12.cardinal * 12,
        height: 22, // approximate 12 + 10//  names.split("\n").length*(12+10), // idem
        fontSize:"12px"
      }
    } else {
      this.freeText = { ...freeText }
    }

    this.position = position ?? {x: 50, y: 50}
    this.colorPitchOn = colorPitchOn ?? 'black'
    this.colorPitchOff = colorPitchOff ?? 'white'
    this.indexFormDrawer = indexFormDrawer ?? 0
    this.isSelected = isSelected ?? false
    this.showName = showName ?? false
    this.showPcs = showPcs ?? false
    this.showPivot = showPivot ?? true
    this.octotrope = octotrope ? { ...octotrope} : { size: 50 }
    // construct 3 new objects (else they are shared)
    this.uiMusaic = uiMusaic ? {...uiMusaic} : new UIMusaic()
    this.uiClock = uiClock ? {...uiClock} : new UIClock()
    this.uiScore = uiScore ? {...uiScore} : {
      height: 76,
      width: 130
    }
  } // constructor

}
