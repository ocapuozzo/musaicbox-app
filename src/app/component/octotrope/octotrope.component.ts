import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";


const colorMetaClassStabilizer: Map<string, string> = new Map([
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

/**
 * From M1 to M5, clock order
 */
const indexOperationOctotrope = [['M1', 'CM1'], ['M7', 'CM7'], ['M11', 'CM11'], ['M5', 'CM5']]


@Component({
  selector: 'app-octotrope',
  standalone: true,
  imports: [],
  templateUrl: './octotrope.component.html',
  styleUrl: './octotrope.component.css'
})
export class OctotropeComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  @Input() pcs: IPcs = new IPcs({strPcs:'0,3, 6, 9'}).musaicPrimeForm()

  @Input() opStabilizers : string[] = []  // useful for testing

  size = 25
  private ctx: CanvasRenderingContext2D | null;

  @Input() selected = false
  active = true

  ngAfterViewInit() {
    this.draw();
  }

  get w() {
    return this.size
  }

  @Input() set w(value: number) {
    this.size = value
    if (this.canvas) {
      this.draw();
    }
  }

  draw(): void {
    if (this.pcs?.isDetached()) return

    if (this.opStabilizers.length === 0) {
       if (this.pcs === null) {
         console.error("octotrope on no data !!!")
         return;
       }
      this.opStabilizers = this.pcs.stabilizer.motifStabilizer.motifStabOperations
    }

    this.ctx = this.canvas.nativeElement.getContext('2d');

    if (!this.ctx) return

    const size = this.size
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

      if (indexPearlColor + indexPearlColorCplt === 'no') { // test minimalist octotrope :)
        // never pass in this branch, else change 'no' by '' (empty string)
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
          this.ctx.strokeStyle = colorMetaClassStabilizer.get(indexPearlColorCplt) ?? "yellow";
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

          this.ctx.fillStyle = colorMetaClassStabilizer.get(indexPearlColor) ?? "yellow";
          this.ctx.fill()

          this.ctx.closePath()
        }
      }
      ang = ang + 2 * Math.PI / 4;
    }
    this.ctx.restore()
  }
}
