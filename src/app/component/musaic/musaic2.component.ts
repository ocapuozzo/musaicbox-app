import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";

@Component({
  selector: 'app-musaic2',
  standalone: true,
  imports: [],
  template: '<canvas #canvas id="canvas" class="roundedImageBorder roundedImageShadow"></canvas>',
  styleUrl: './musaic2.component.css'
})
export class Musaic2Component {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D;

  private CEL_WIDTH: number = 10

  _pcColorSet = 'black'
  _widthInput = 40

  @Input() ipcs: IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() opaque: boolean = true

  get pcColorSet() {
    return this._pcColorSet
  }
  // https://stackoverflow.com/questions/36653678/angular2-input-to-a-property-with-get-set
  @Input() set pcColorSet(value: string) {
    this._pcColorSet = value
  }

  get w() {
    return this._widthInput //this.canvas.nativeElement.width
  }
  @Input()  set w(value: number) {
    this._widthInput = value
    if (this.canvas) {
      this.canvas.nativeElement.width = value
      this.canvas.nativeElement.height = value //square
      // this.updateGraphicContext()
      this.drawsMusaic();
    }
  }

// ngOnInit() {
//   // @ts-ignore
//   this.context = this.canvas.nativeElement.getContext('2d');
//   // initial view
//   this.drawsMusaic()
// }

  ngAfterViewInit() {

    this.canvas.nativeElement.style.width = "100%";
    // this.canvas.nativeElement.style.height = "100%"; // height may be more than width
    //
    let w = this.canvas.nativeElement?.offsetParent?.clientWidth ?? 40
    this.canvas.nativeElement.width = w // this.canvas.nativeElement.offsetWidth;
    this.canvas.nativeElement.height = w  //this.canvas.nativeElement.offsetHeight;

    this.drawsMusaic();

  }

  private updateGraphicContext() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    // this.canvas.nativeElement.style.width = "100%"; in ngAfterViewInit
    let w = this.canvas.nativeElement?.offsetParent?.clientWidth ?? 40

    let n = this.ipcs.nMapping //getMappedBinPcs().length;

    this.CEL_WIDTH = w / (n + 1);

    // dimension of musaic match with cell size
    // square (n+1) x (n+1)
    console.log("w = " + w)
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
          ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          // when black is minority, add outline
          // TODO in future, check when nbCEL is < n
          if (this.opaque || this.ipcs.cardinal < 6) {
            ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          }
        } else {
          if (this.opaque) {
            ctx.fillStyle = "white";
            ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
            ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          }
        }
      }
    }
    // ctx.strokeRect(0, 0,
    //   this.canvas.nativeElement!.parentElement!.clientWidth - 1,
    //   this.canvas.nativeElement!.parentElement!.clientWidth - 1);
    ctx.strokeRect(0, 0,
      this.canvas.nativeElement.clientWidth - 1,
      this.canvas.nativeElement.clientWidth - 1);
  }

}
