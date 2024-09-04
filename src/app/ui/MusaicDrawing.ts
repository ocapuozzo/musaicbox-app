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

    let opaque = this.pcsDto.uiMusaic.opaque
    let n = this.pcsDto.pcs.nMapping //getMappedBinPcs().length;

    let ctx = this.ctx
    ctx.fillStyle = this.pcsDto.colorPitchOff

    if (opaque) {
      // pre fill paint background with off pitches color
      ctx.strokeStyle = this.pcsDto.colorPitchOff
      ctx.fillRect(0, 0, this.pcsDto.uiMusaic.width, this.pcsDto.uiMusaic.height)
    }

    let CEL_WIDTH = this.pcsDto.uiMusaic.widthCell ?? 20

    // Draws musaic
    // loop n+1 for exact correlation between geometry ops and algebra ops
    // display *iPivot centered* for bijective relation geometry <-> algebra
    // Example.
    //   pcsList : ({0, 3, 6, 9}, iPivot=0)
    //   pcsList : ({1, 4, 7, 10}, iPivot=1)
    // are same IS, are same Musaic representation
    // let iPivot = this.pcsList.iPivot ?? 0


    ctx.reset() //translate(0.5,0.5);
    const pivotMapped = this.pcsDto.pcs.templateMappingBinPcs[this.pcsDto.pcs.iPivot ?? 0]
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        if (this.pcsDto.pcs.getMappedBinPcs()[(i + pivotMapped + j * 5) % n] === 1) {
          ctx.fillStyle = this.pcsDto.colorPitchOn;
          ctx.strokeStyle = this.pcsDto.colorPitchOn;
          ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
        } else {
          // already fill
          if (this.pcsDto.pcs.cardinal === 0) {
            ctx.strokeStyle = this.pcsDto.colorPitchOn;
            ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          }
        }
      }
    }
    // border draw by musaic.css : outline: 1px solid back;
    // ctx.strokeStyle = this.pcsDto.colorPitchOn
   // ctx.strokeRect(0,0, CEL_WIDTH * (n+1) -1, CEL_WIDTH * (n+1) -1)
  }
}
