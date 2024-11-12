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
import {IPcs} from "../core/IPcs";

/**
 * From M1 to M5, clock order
 */
const indexOperationOctotrope = [['M1', 'CM1'], ['M7', 'CM7'], ['M11', 'CM11'], ['M5', 'CM5']]


const colorMotifClassStabilizer: Map<string, string> = new Map([
  ['', 'lightgray'],
  ['M1', 'black'],
  ['CM1', 'black'],
  ['M7', 'red'],
  ['CM7', 'red'],
  ['M11', 'blue'],
  ['CM11', 'blue'],
  ['M5', 'green'],
  ['CM5', 'green']
])

export class OctotropeDrawing {
  pcsDto : UIPcsDto
  opStabilizers : string[]
  ctx: CanvasRenderingContext2D
  pcsInMusaicGroup : IPcs  // for octotrope

  constructor(
    x: {
      pcsDto?: UIPcsDto
      ctx?: CanvasRenderingContext2D
    } = {}) {
    if (!x.ctx)
      throw new Error("canvas context missing !!!")

    if (this.pcsDto.pcs?.isDetached()) return

    this.ctx = x.ctx
    this.pcsDto = x.pcsDto ?? new UIPcsDto()

    this.pcsInMusaicGroup = this.pcsDto.pcs.musaicPrimeForm()
    this.opStabilizers = this.pcsInMusaicGroup.stabilizer.motifStabilizer.motifStabOperations
    }

  drawOctotrope() {

    const size = this.pcsDto.width // default uimusaic width

    const RATIO_LARGE_CIRCLE = 9; // complement circle is bigger
    const RATIO_SMALL_CIRCLE = 16; //

    let ox = size / 2;
    let oy = size / 2;

    let radius = Math.round(size / 3);

    this.ctx.save()

    // draw polygon diamond
    this.ctx.beginPath();
    this.ctx.lineWidth = size / 24;
    this.ctx.strokeStyle = "rgba(185, 185, 185)" // gray

    let ang = 3 * Math.PI / 2;
    for (let index = 0; index <= 4; index++) {
      let x = Math.round(ox + Math.cos(ang) * radius);
      let y = Math.round(oy + Math.sin(ang) * radius);
      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
      ang = ang + 2 * Math.PI / 4;
    }
    this.ctx.stroke()
    this.ctx.closePath()

    // draw pearl's diamond
    ang = 3 * Math.PI / 2;
    for (let index = 0; index < indexOperationOctotrope.length; index++) {
      let x = Math.round(ox + Math.cos(ang) * radius);
      let y = Math.round(oy + Math.sin(ang) * radius);

      this.ctx.lineWidth = Math.round(size / 32);

      let indexPearlColor = this.opStabilizers.includes(indexOperationOctotrope[index][0])
        ? indexOperationOctotrope[index][0] // M1 ou M5, or M7 or M11
        : ''
      let indexPearlColorCplt = this.opStabilizers.includes(indexOperationOctotrope[index][1])
        ? indexOperationOctotrope[index][1] // CM1 ou CM5, or CM7 or CM11
        : ''

      const minimal = true
      if (indexPearlColor + indexPearlColorCplt === '' && !minimal) {
        // never pass in this branch, else change value 'minimal' by false
        // NO operation Mx CMx stabilizer, draw gray pearl
        this.ctx.beginPath();
        this.ctx.lineWidth = 1
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)" //'white'
        this.ctx.arc(x, y, size / (RATIO_LARGE_CIRCLE - 1), 0, 2 * Math.PI);
        this.ctx.fill()

        this.ctx.strokeStyle = "rgba(180, 180, 180, 0.5)"; // gray
        this.ctx.arc(x, y, size / (RATIO_LARGE_CIRCLE - 1), 0, 2 * Math.PI);
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.beginPath()
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgba(160, 160, 160, 0.5)"
        this.ctx.arc(x, y, size / (RATIO_SMALL_CIRCLE - 1), 0, 2 * Math.PI);

        this.ctx.stroke()
        this.ctx.fillStyle = "rgba(200, 200, 200, 0.5)"
        this.ctx.fill()

        this.ctx.closePath()
      } else {

        if (indexPearlColorCplt) {
          this.ctx.beginPath();
          this.ctx.fillStyle = 'white'
          this.ctx.arc(x, y, size / RATIO_LARGE_CIRCLE, 0, 2 * Math.PI);
          this.ctx.fill()

          this.ctx.lineWidth = Math.round(size / 32);
          this.ctx.strokeStyle = colorMotifClassStabilizer.get(indexPearlColorCplt) ?? "yellow";
          this.ctx.arc(x, y, size / RATIO_LARGE_CIRCLE, 0, 2 * Math.PI);
          this.ctx.stroke()
          this.ctx.closePath()
        }

        if (indexPearlColor) {
          this.ctx.beginPath();
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "black"
          this.ctx.arc(x, y, size / RATIO_SMALL_CIRCLE, 0, 2 * Math.PI);
          this.ctx.stroke()

          this.ctx.fillStyle = colorMotifClassStabilizer.get(indexPearlColor) ?? "yellow";
          this.ctx.fill()

          this.ctx.closePath()
        }
      }
      ang = ang + 2 * Math.PI / 4;
    }
    this.ctx.restore()
  }
}
