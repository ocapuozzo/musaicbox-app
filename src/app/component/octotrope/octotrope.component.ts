import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {OctotropeDrawing} from "../../ui/OctotropeDrawing";
import {UIPcsDto} from "../../ui/UIPcsDto";


const COLOR_META_STABILIZER: Map<string, string> = new Map([
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
const ORDERED_OCTOTROPE_OPS = [['M1', 'CM1'], ['M7', 'CM7'], ['M11', 'CM11'], ['M5', 'CM5']]


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
  @Input() selected = false

  size = 25 // wrapper by w property
  private ctx: CanvasRenderingContext2D | null;
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
    if (this.opStabilizers.length === 0) {
      if (this.pcs === null || !this.pcs?.isComingFromAnOrbit()) {
        console.error("octotrope on no data !!!")
        return;
      }
      // if no opStabilizers then initialize here
      // this.opStabilizers = this.pcs.stabilizer.metaStabilizer.metaStabOperations
      this.opStabilizers = this.pcs.orbit.metaStabilizer.metaStabOperations
    }

    this.ctx = this.canvas.nativeElement.getContext('2d');
    if (!this.ctx) return

    const uiPcsDto = new UIPcsDto({pcs:this.pcs, indexFormDrawer:UIPcsDto.OCTOTROPE, octotrope:{size:this.w}})

    const formDrawing = new OctotropeDrawing({opStabilizers: this.opStabilizers, ctx:this.ctx, pcsDto:uiPcsDto})
    formDrawing.drawOctotrope()
  }

}
