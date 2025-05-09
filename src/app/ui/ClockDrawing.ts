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

const PITCH_LINE_WIDTH = 4;

export class ClockDrawing {
  pcs = new IPcs({strPcs: "[0,3,7]"});
  ctx ?: CanvasRenderingContext2D;  // canvas context
  width = 20;
  height = 20;
  pc_pivot_color = "red";
  pc_color_fill = "yellow";
  pc_color_stroke = "black";
  drawPivot = true
  segmentsLineDash: number[][] = [[1, 3], [1, 3, 3, 1]] // median, inter
  n: number // vector dimension
  pointsRegions: Rect[]
  pointsAxesSym: Point[]

  // experimental
  private indexPlaying: number  = -1

  constructor(
    x: {
      ipcs?: IPcs,
      ctx?: CanvasRenderingContext2D,
      width?: number,
      height?: number,
      pc_pivot_color?: string,
      pc_color_fill?: string,
      pc_color_stroke?: string,
      segmentsLineDash?: number[][],
      drawPivot?:boolean,
      indexPlaying?: number
    } = {}) {
    if (!x.ctx)
      throw new Error("canvas context missing !!!")

    this.pcs = x.ipcs ?? new IPcs({strPcs: "[0,3,7"})
    if (x.ctx)
      this.ctx = x.ctx

    this.width = x.width ?? 20
    this.height = x.height ?? 20
    this.pc_color_fill = x.pc_color_fill ?? "yellow"
    this.pc_pivot_color = x.pc_pivot_color ?? "red"
    this.pc_color_stroke = x.pc_color_stroke ?? 'black'
    this.drawPivot = x.drawPivot == undefined  ? true : x.drawPivot
    this.n = this.pcs.nMapping
    this.pointsRegions = []
    this.pointsAxesSym = []
    this.segmentsLineDash = x.segmentsLineDash ?? [[1, 3], [1, 3, 3, 1]]
    this.indexPlaying = x.indexPlaying ?? -1
  }

  setIpcs(ipcs: IPcs) {
    this.pcs = ipcs
  }

  isSelected(i: number): boolean {
    return this.pcs.getMappedVectorPcs()[i] === 1;
  }

  // pass IPcs instance in parameter ? for store reactive ?
  draw(pcs?: IPcs) {
    if (!this.ctx) return
    if (pcs) this.pcs = pcs
    let ox = this.width / 2;
    let oy = this.height / 2;
    // let radius = Math.round(ox * .74);
    let radius = Math.round(this.width * (3/8));
    this.computePitchesRegion(ox, oy, radius);
    this.ctx.save()
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawPolygon(this.ctx);
    this.drawAxesSymmetry(this.ctx)
    this.ctx.translate(ox, oy);
    this.drawPitches(this.ctx, radius);
    this.ctx.translate(-ox, -oy);
    this.ctx.restore();
  }

  drawCircleAndPitch(ctx: CanvasRenderingContext2D, index: number, radius: number) {
    let grad;
    ctx.save()
    ctx.beginPath();

    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke()

    if (radius  > 1 ) {
      
      // console.log("index : " + index + " selected : " + this.isSelected(index));
      ctx.fillStyle =
        (this.isSelected(index))
          ? (index === this.pcs.templateMapping[this.pcs.iPivot ?? 0])
            ? this.drawPivot ? this.pc_pivot_color : this.pc_color_fill
            : this.pc_color_fill
          : this.pcs.templateMapping.includes(index) ? 'white' : 'lightgray';

      ctx.fill();
    }
    if (radius >= 6) {
      // draw text
      grad = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.2);
      if (radius > 10) {
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.5, 'white');
        grad.addColorStop(1, '#333');
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = (radius > 10) ? PITCH_LINE_WIDTH : 1;//lineWidth; //radius*0.1;
      ctx.stroke();
      ctx.beginPath();
      if (radius > 10) {
        ctx.fillStyle = '#333';
        ctx.fill();
      }
      ctx.fillStyle = "black"
      ctx.strokeStyle = "black";
      let pitch = index.toString()
      let textWidth = ctx.measureText(pitch).width;
      // Math.round(radius * 0.1) is font size (drawPitches)
      let y = Math.round(radius * 0.1) /2
      let x = Math.round(textWidth/2/Math.ceil(radius*2))
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(pitch, x, y);
    }

    // console.log("this.indexPlaying, index  ", this.indexPlaying, index)
    if (this.indexPlaying === index && radius > 1) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgb(0 0 255 /30%)"
      ctx.fill();
      ctx.closePath()
    }
    ctx.restore()
  }

  drawPitches(ctx: CanvasRenderingContext2D, radius: number) {
    let ang;
    ctx.font = Math.round(radius * 0.1) + "px arial";
    let radiusPitch = Math.round(radius / 9);

    ctx.strokeStyle = this.pc_color_stroke
    for (let index = 0; index < this.n; index++) {
      ang = index * Math.PI / (this.n / 2);
      // console.log(this.$options.points[index].toString());
      ctx.rotate(ang);
      ctx.translate(0, -radius);
      ctx.rotate(-ang);
      this.drawCircleAndPitch(ctx, index, radiusPitch /*, PITCH_LINE_WIDTH*/);
      ctx.rotate(ang);
      ctx.translate(0, radius);
      ctx.rotate(-ang);
    }
  }

  drawPolygon(ctx: CanvasRenderingContext2D) {
    let pointsRegions = this.pointsRegions;
    let firstPoint = true;
    ctx.save();
    ctx.fillStyle = this.pc_color_stroke // 'black'
    ctx.beginPath();
    for (let i = 0; i < this.n; i++) {
      if (this.pcs.getMappedVectorPcs()[i] === 1 && firstPoint) {
        firstPoint = false;
        ctx.moveTo(pointsRegions[i].x, pointsRegions[i].y);
      } else if (this.pcs.getMappedVectorPcs()[i] === 1) {
        ctx.lineTo(pointsRegions[i].x, pointsRegions[i].y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  drawAxeMedian(i: number, revOX: number, revOY: number, ctx: CanvasRenderingContext2D) {
    let points = this.pointsAxesSym;
    let x1 = points[i * 2].x
    let y1 = points[i * 2].y
    let i2 = (Math.round(this.n / 2) + i) % this.n;
    let nEven = this.n % 2 === 0;
    let delta = nEven ? 0 : -1;
    let x2 = points[(i2 * 2 + delta + this.n * 2) % (this.n * 2)].x;
    let y2 = points[(i2 * 2 + delta + this.n * 2) % (this.n * 2)].y;
    ctx.save();
    ctx.beginPath()
    ctx.setLineDash(this.segmentsLineDash[0]);
    ctx.moveTo(revOX, revOY)
    ctx.lineTo(x2, y2)
    ctx.moveTo(revOX, revOY)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.restore()
  }

  drawAxeInter(i: number, revOX: number, revOY: number, ctx: CanvasRenderingContext2D) {
    let points = this.pointsAxesSym;
    let x1 = points[((i * 2 + 1) + this.n * 2) % (this.n * 2)].x
    let y1 = points[((i * 2 + 1) + this.n * 2) % (this.n * 2)].y

    let i2 = (this.n / 2 + i) % this.n;
    let nEven = this.n % 2 === 0;
    if (!nEven)
      i2 -= 1;

    let x2 = points[((i2 * 2 + 1) + this.n * 2) % (this.n * 2)].x
    let y2 = points[((i2 * 2 + 1) + this.n * 2) % (this.n * 2)].y

    ctx.save();
    ctx.setLineDash(this.segmentsLineDash[1]);
    ctx.beginPath()
    ctx.moveTo(revOX, revOY)
    ctx.lineTo(x2, y2)
    ctx.moveTo(revOX, revOY)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.restore();
  }

  drawAxesSymmetry(ctx: CanvasRenderingContext2D) {
    let ox = this.width / 2;
    let oy = this.height / 2;
    let axesSym = this.pcs.getAxialSymmetries()

    for (let i = 0; i < axesSym.symMedian.length; i++) {
      if (axesSym.symMedian[i] === 1) {
        this.drawAxeMedian(i, ox, oy, ctx);
      }
      if (axesSym.symInter[i] === 1) {
        this.drawAxeInter(i, ox, oy, ctx);
      }
    }
  }

  computePitchesRegion(ox: number, oy: number, radius: number) {
    if (this.pointsRegions.length < this.n) {
      this.pointsRegions = new Array(this.n)
      this.pointsAxesSym = new Array(this.n * 2)
    }

    // console.log("this.n : " + this.n)
    // console.log("ox :" + ox + "  oy : "+oy + " radius : " + radius)
    let radiusPitch = Math.round(radius / (this.n - 1));
    let radiusAxesSym = radius * 1.3 // more length ?
    let x;
    let y;
    let ang = 3 * Math.PI / 2;
    for (let index = 0; index < this.n; index++) {
      x = radiusPitch * 2 + Math.round(ox + Math.cos(ang) * radius);
      y = radiusPitch * 2 + Math.round(oy + Math.sin(ang) * radius);
      // console.log("ox : " + ox +"  x:" + x + " y:" + y);
      this.pointsRegions[index] = new Rect(
        x - radiusPitch * 2,
        y - radiusPitch * 2,
        radiusPitch * 3, // width rectangle
        radiusPitch * 3); // square...
      ang = ang + 2 * Math.PI / this.n;
    }
    // compute points for axes symmetry (*2 because inter pitches)
    ang = 3 * Math.PI / 2;
    for (let index = 0; index < this.n * 2; index++) {
      let x = Math.round(ox + Math.cos(ang) * radiusAxesSym);
      let y = Math.round(oy + Math.sin(ang) * radiusAxesSym);
      this.pointsAxesSym[index] = new Point(x, y)
      ang = ang + 2 * Math.PI / (this.n * 2);
    }
  }

  getIndexPitchFromXY(x1: number, y1: number): number {
    return this.pointsRegions.findIndex(p => p.contains(x1, y1))
  }
}
