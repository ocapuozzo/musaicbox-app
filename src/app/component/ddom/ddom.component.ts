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
const indexOperationDiamond = [['M1', 'CM1'], ['M7', 'CM7'], ['M11', 'CM11'], ['M5', 'CM5']]


@Component({
  selector: 'app-ddom',
  standalone: true,
  imports: [],
  templateUrl: './ddom.component.html',
  styleUrl: './ddom.component.css'
})
export class DdomComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  @Input() pcs: IPcs | null = null
  @Input() opStabilizers : string[] = []

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
         console.error("ddom on no data !!!")
         return;
       }
      this.opStabilizers = this.pcs.stabilizer.motifStabilizer.motifStabOperations
    }

    // console.log("draw()")
    this.ctx = this.canvas.nativeElement.getContext('2d');
    if (!this.ctx) return

    const size = this.size

   // let stabilizers = this.pcs.stabilizer.motifStabilizer.motifStabOperations
    let ox = size / 2;
    let oy = size / 2;

    // console.log("ox : ", ox)
    // console.log("oy : ", oy)
    // console.log("width : ", size)

    let radius = Math.round(size / 4);
    let radius2 = Math.round(size / 3);

    this.ctx.save()

    // draw polygon diamond
    this.ctx.beginPath();
    this.ctx.lineWidth = radius / 6;
    this.ctx.strokeStyle = "rgba(185, 185, 185)" // "gray";

    let ang = 3 * Math.PI / 2;
    for (let index = 0; index <= 4; index++) {
      let x = Math.round(ox + Math.cos(ang) * radius2);
      let y = Math.round(oy + Math.sin(ang) * radius2);
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
    for (let index = 0; index < indexOperationDiamond.length; index++) {
      let x = Math.round(ox + Math.cos(ang) * radius2);
      let y = Math.round(oy + Math.sin(ang) * radius2);

      this.ctx.lineWidth = Math.round(radius / 8);

      let indexPearlColor = this.opStabilizers.includes(indexOperationDiamond[index][0])
        ? indexOperationDiamond[index][0] // M1 ou M5, or M7 or M11
        : ''
      let indexPearlColorCplt = this.opStabilizers.includes(indexOperationDiamond[index][1])
        ? indexOperationDiamond[index][1] // CM1 ou CM5, or CM7 or CM11
        : ''

      if (indexPearlColor + indexPearlColorCplt === '') {
        // NO operation Mx CMx stabilizer, draw gray pearl
        this.ctx.beginPath();
        this.ctx.lineWidth = 1 // Math.round(radius / 10);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)" //'white'
        this.ctx.arc(x, y, size / 8, 0, 2 * Math.PI);
        this.ctx.fill()

        this.ctx.strokeStyle = "rgba(180, 180, 180, 0.5)"; // gray
        this.ctx.arc(x, y, size / 8, 0, 2 * Math.PI);
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.beginPath()
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgba(160, 160, 160, 0.5)"
        this.ctx.arc(x, y, size / 15, 0, 2 * Math.PI);

        this.ctx.stroke()
        this.ctx.fillStyle = "rgba(200, 200, 200, 0.5)"
        this.ctx.fill()

        this.ctx.closePath()
      } else {

        if (indexPearlColorCplt) {
          this.ctx.beginPath();
          this.ctx.fillStyle = 'white'
          this.ctx.arc(x, y, size / 9, 0, 2 * Math.PI);
          this.ctx.fill()
          this.ctx.lineWidth = Math.round(radius / 8);
          this.ctx.strokeStyle = colorMetaClassStabilizer.get(indexPearlColorCplt) ?? "yellow";
          this.ctx.arc(x, y, size / 9, 0, 2 * Math.PI);
          this.ctx.stroke()
          this.ctx.closePath()
        }

        if (indexPearlColor) {
          this.ctx.beginPath();
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "black"
          this.ctx.arc(x, y, size / 16, 0, 2 * Math.PI);
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
