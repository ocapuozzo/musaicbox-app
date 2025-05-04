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


import {UIPcsDto} from "./UIPcsDto";

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
    let rounded = this.pcsDto.uiMusaic.rounded
    const scale = window.devicePixelRatio || 1;
    const borderRadius = 1

    let n = this.pcsDto.pcs.nMapping

    let ctx = this.ctx

    const width = this.pcsDto.uiMusaic.width
    const height = this.pcsDto.uiMusaic.height
    const delta = 1
    if (rounded) {
      ctx.beginPath()
      // const path = new Path2D();
      // ctx.rect(delta, delta, width/3 - delta * 2, height - delta * 2);
      ctx.roundRect(delta, delta, width - delta * 2, height - delta * 2, width/2);
      // path.roundRect(delta, delta, width - delta * 2, height - delta * 2, borderRadius * scale);
      // ctx.clip(path);
      ctx.stroke()
      ctx.clip();
      // ctx.arc(10, 10, 50, 0, Math.PI * 2);
      // ctx.clip();
      // console.log("rounded")
    }

    const CEL_WIDTH = this.pcsDto.uiMusaic.widthCell ?? 20

    ctx.fillStyle = this.pcsDto.colorPitchOff
    if (opaque) {
      // pre fill paint background with off pitches color
      ctx.strokeStyle = this.pcsDto.colorPitchOff
      ctx.fillStyle = this.pcsDto.colorPitchOff
      ctx.fillRect(0, 0, this.pcsDto.uiMusaic.width, this.pcsDto.uiMusaic.height)
    }

    // Draws musaic
    // loop n+1 for exact correlation between geometry ops and algebra ops
    // display *iPivot centered* for bijective relation geometry <-> algebra
    // Example.
    //   pcs : ({0, 3, 6, 9}, iPivot=0)
    //   pcs : ({1, 4, 7, 10}, iPivot=1)
    // are same IS, are same Musaic representation
    // let iPivot = this.pcs.iPivot ?? 0

    const pivotMapped = this.pcsDto.pcs.templateMapping[this.pcsDto.pcs.iPivot ?? 0]
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        if (this.pcsDto.pcs.getMappedVectorPcs()[(i + pivotMapped + j * 5) % n] === 1) {
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
    const borderWidth: number = 1
    const borderColor: string = 'black' // '#333'
    // border draw by musaic.css : outline: 1px solid back;
    // ctx.strokeStyle = this.pcsDto.colorPitchOn
    // ctx.strokeRect(0,0, CEL_WIDTH * (n+1) -1, CEL_WIDTH * (n+1) -1)
    //Draw the border if rounded

    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.roundRect(delta, delta, width - delta * 2, height - delta * 2, rounded ? width/2 :  0);
    ctx.stroke();
    
  }
}
