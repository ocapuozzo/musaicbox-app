import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-musaic3',
  standalone: true,
  imports: [
    NgClass
  ],
  template: '<canvas #canvas id="canvas" [ngClass]="{\'roundedImageBorder roundedImageShadow\': rounded, \'musaic\': true}"></canvas>',
  // template: '<canvas #canvas id="canvas" class="musaic"></canvas>',
  styleUrl: './musaic3.component.css'
})
export class Musaic3Component {
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

    let n = this.ipcs.nMapping //getMappedBinPcs().length;
    this.CEL_WIDTH = Math.floor((this.w / (n + 1)));
    let wAdjust = this.CEL_WIDTH * (n + 1)

    // this.canvas.nativeElement.width = this.w
    // this.canvas.nativeElement.height = this.w // square


    // this.canvas.nativeElement.width = wAdjust
    // this.canvas.nativeElement.height = wAdjust // square
    this._widthInput = wAdjust - 15
    this.canvas.nativeElement.width = this._widthInput //wAdjust
    this.canvas.nativeElement.height = this._widthInput //wAdjust// square
    this._widthInput = wAdjust

    // this.deltaCenterX = 1
    // this.deltaCenterY = 1
    // this.deltaCenterX = (this.canvas.nativeElement.clientWidth - (this.CEL_WIDTH * (n+1))) / 2
    // this.deltaCenterY = (this.canvas.nativeElement.clientHeight - (this.CEL_WIDTH * (n+1))) / 2
    // console.log("deltaCenterX = " + this.deltaCenterX)
    // this.CEL_WIDTH = this.w / (n + 1);

    // dimension of musaic match with cell size
    // square (n+1) x (n+1)

    // parent style do include text-align: center AND w more small that clientWidth parent
    console.log("w = " + this.w)
    console.log("cell w = " + this.CEL_WIDTH)

  }

  drawsMusaic() {
    this.updateGraphicContext()

    let n = this.ipcs.nMapping //getMappedBinPcs().length;

    let ctx = this.context
    ctx.strokeStyle = this.pcColorSet //"black";

    let CEL_WIDTH = this.CEL_WIDTH
    // Draws musaic
    // loop n+1 for exact correlation between geometry ops and algebra ops
    // display *iPivot centered* for bijective relation geometry <-> algebra
    // Example.
    //   pcsList : ({0, 3, 6, 9}, iPivot=0)
    //   pcsList : ({1, 4, 7, 10}, iPivot=1)
    // are same IS, are same Musaic representation
    // let iPivot = this.pcsList.iPivot ?? 0
    const pivotMapped = this.ipcs.templateMappingBinPcs[this.ipcs.iPivot ?? 0]
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        if (this.ipcs.getMappedBinPcs()[(i + pivotMapped + j * 5) % n] === 1) {
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
