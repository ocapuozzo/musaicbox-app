/**
 * Copyright (c) 2019. Olivier Capuozzo
 *
 * This file is part of the musaicbox project
 *
 * (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 * For the full copyright and license information, please view the README.md
 * file on git server.
 */

import {IPcs} from "../core/IPcs";
import {Rect} from "../utils/Rect"
import {Point} from "../utils/Point"
import {UIPcsDto} from "./UIPcsDto";

const PITCH_LINE_WIDTH = 4;

export class MusaicDrawing {
  pcsDto : UIPcsDto
  ctx: CanvasRenderingContext2D

  constructor(
    x: {
      pcsDto?: UIPcsDto
      ctx?: CanvasRenderingContext2D,
    } = {}) {
    if (!x.ctx)
      throw new Error("canvas context missing !!!")
    this.ctx = x.ctx

    this.pcsDto = x.pcsDto ?? new UIPcsDto()
  }


  drawMusaic() {

    // TODO a faire par l'appelant =>  this.updateGraphicContext()

    let n = this.pcsDto.pcs.nMapping //getMappedBinPcs().length;

    let ctx = this.ctx
    ctx.strokeStyle = this.pcsDto.colorPitchOff

    // console.log("this.pcsDto.uiMusaic.width :" + this.pcsDto.uiMusaic.width)
    // console.log("this.pcsDto.uiMusaic.height :" + this.pcsDto.uiMusaic.height)

    let CEL_WIDTH = this.pcsDto.uiMusaic.widthCell ?? 20
    let deltaCenterX = 0// Math.round(this.pcsDto.uiMusaic.width - (CEL_WIDTH * this.pcsDto.uiMusaic.nbCellsPerLine))/2
    let deltaCenterY = 0// Math.round(this.pcsDto.uiMusaic.height - (CEL_WIDTH * this.pcsDto.uiMusaic.nbCellsPerRow))/2

    // Draws musaic
    // loop n+1 for exact correlation between geometry ops and algebra ops
    // display *iPivot centered* for bijective relation geometry <-> algebra
    // Example.
    //   pcsList : ({0, 3, 6, 9}, iPivot=0)
    //   pcsList : ({1, 4, 7, 10}, iPivot=1)
    // are same IS, are same Musaic representation
    // let iPivot = this.pcsList.iPivot ?? 0

    const pivotMapped = this.pcsDto.pcs.templateMappingBinPcs[this.pcsDto.pcs.iPivot ?? 0]
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        if (this.pcsDto.pcs.getMappedBinPcs()[(i + pivotMapped + j * 5) % n] === 1) {
          ctx.fillStyle = this.pcsDto.colorPitchOn;
          // ctx.strokeStyle = this.pcColorSet;

          ctx.fillRect(j * CEL_WIDTH + deltaCenterX, i * CEL_WIDTH + deltaCenterY, CEL_WIDTH, CEL_WIDTH);
          // No good idea, lines drawing are not clear (blurry when this.w is small)
          // if (this.opaque || this.ipcs.cardinal < 5) {
          //   ctx.strokeRect(j * CEL_WIDTH + this.deltaCenterX, i * CEL_WIDTH+ this.deltaCenterY, CEL_WIDTH, CEL_WIDTH);
          // }
        } else {
          if (this.pcsDto.uiMusaic.drawGrid) { // TODO rename by !opaque ?
            ctx.fillStyle = this.pcsDto.colorPitchOff
            // TODO if transparent, no fill rect, or set color with opacity by rgb function ?
            // https://stackoverflow.com/questions/56112155/set-css-color-using-color-text-name-like-red-and-also-set-opacity
            // https://stackoverflow.com/questions/2359537/how-to-change-the-opacity-alpha-transparency-of-an-element-in-a-canvas-elemen
            ctx.fillRect(j * CEL_WIDTH + deltaCenterX, i * CEL_WIDTH + deltaCenterY, CEL_WIDTH, CEL_WIDTH);
            ctx.strokeRect(j * CEL_WIDTH + deltaCenterX, i * CEL_WIDTH + deltaCenterY, CEL_WIDTH, CEL_WIDTH);
          }
        }
      }
    }
    ctx.strokeStyle = this.pcsDto.colorPitchOn
    ctx.strokeRect(deltaCenterX, deltaCenterY, CEL_WIDTH * (n+1) -1, CEL_WIDTH * (n+1) -1)
  }
}
