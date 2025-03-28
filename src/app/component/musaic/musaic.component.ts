import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-musaic',
  standalone: true,
  imports: [
    NgClass
  ],
  template: '<canvas #canvas id="canvas" [ngClass]="{\'roundedImageBorder roundedImageShadow\': rounded, \'musaic\': true}"></canvas>',
  // template: '<canvas #canvas id="canvas" class="musaic"></canvas>',
  styleUrl: './musaic.component.css'
})
export class MusaicComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D;

  private CEL_WIDTH: number = 10

  _pcColorSet = 'black'
  _widthInput = 40
  deltaCenterX = 0
  deltaCenterY = 0

  @Input() ipcs: IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() opaque: boolean = true
  @Input() rounded: boolean = true

  get pcColorSet() {
    return this._pcColorSet
  }
  // https://stackoverflow.com/questions/36653678/angular2-input-to-a-property-with-get-set
  @Input() set pcColorSet(value: string) {
    this._pcColorSet = value
  }

  get w() {
    return this._widthInput
  }
  @Input() set w(value: number) {
    this._widthInput = value
    if (this.canvas) {
      this.drawsMusaic();
    }
  }

// ngOnInit() {

// }

  ngAfterViewInit() {
    this.drawsMusaic();
  }

  private updateGraphicContext() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let paddingCanvas = 1

    this._widthInput = this._widthInput * paddingCanvas

    let n = this.ipcs.nMapping //getMappedVectorPcs().length;
    this.CEL_WIDTH = Math.floor((this._widthInput / (n + 1)));

    // adjust size from CEL_WIDTH
    this._widthInput = this.CEL_WIDTH * (n + 1)
    let h = this._widthInput
    this.canvas.nativeElement.width = this._widthInput
    this.canvas.nativeElement.height = h  // square

    // console.log("w = " + this.w)
    // console.log("cell w = " + this.CEL_WIDTH)

  }

  drawsMusaic() {
    this.updateGraphicContext()

    let n = this.ipcs.nMapping //getMappedVectorPcs().length;

    let ctx = this.context
    ctx.strokeStyle = this.pcColorSet //"black";

    let CEL_WIDTH = this.CEL_WIDTH
    // Draws musaic
    // loop n+1 for exact correlation between geometry ops and algebra ops
    // display *iPivot centered* for bijective relation geometry <-> algebra
    // Example.
    //   pcs : ({0, 3, 6, 9}, iPivot=0)
    //   pcs : ({1, 4, 7, 10}, iPivot=1)
    // are same IS, are same Musaic representation
    // let iPivot = this..iPivot ?? 0
    const pivotMapped = this.ipcs.templateMapping[this.ipcs.iPivot ?? 0]
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        if (this.ipcs.getMappedVectorPcs()[(i + pivotMapped + j * 5) % n] === 1) {
          ctx.fillStyle = this.pcColorSet;
          // ctx.strokeStyle = this.pcColorSet;

          ctx.fillRect(j * CEL_WIDTH + this.deltaCenterX, i * CEL_WIDTH + this.deltaCenterY, CEL_WIDTH, CEL_WIDTH);
          // No good idea, lines drawing are not clear (blurry when this.w is small)
          // if (this.opaque || this.ipcs.cardinal < 5) {
          //   ctx.strokeRect(j * CEL_WIDTH + this.deltaCenterX, i * CEL_WIDTH+ this.deltaCenterY, CEL_WIDTH, CEL_WIDTH);
          // }
        } else {
          if (this.opaque) {
            ctx.fillStyle = "white";
            ctx.fillRect(j * CEL_WIDTH + this.deltaCenterX, i * CEL_WIDTH + this.deltaCenterY, CEL_WIDTH, CEL_WIDTH);
            ctx.strokeRect(j * CEL_WIDTH + this.deltaCenterX, i * CEL_WIDTH + this.deltaCenterY, CEL_WIDTH, CEL_WIDTH);
          }
        }
      }
    }
    // ctx.strokeRect(0, 0,
    //   this.canvas.nativeElement!.parentElement!.clientWidth - 1,
    //   this.canvas.nativeElement!.parentElement!.clientWidth - 1);
    // ctx.strokeRect(0, 0,
    //   this.w  + this.deltaCenterX*2,
    //   this.w  + this.deltaCenterY*2);
  }

}
