import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";

@Component({
  selector: 'app-musaic',
  standalone: true,
  imports: [],
  templateUrl: './musaic.component.html',
  styleUrl: './musaic.component.css'
})
export class MusaicComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('containercanvas', {static: false}) containerCanvas: ElementRef<HTMLCanvasElement>

  private context: CanvasRenderingContext2D;

  private CEL_WIDTH : number = 10

  @Input() ipcs: IPcs = new IPcs({strPcs: "0,3,6,9"})
  @Input() opaque : boolean = true

  // ngOnInit() {
  //   // @ts-ignore
  //   this.context = this.canvas.nativeElement.getContext('2d');
  //   // initial view
  //   this.drawsMusaic()
  // }

  ngAfterViewInit() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');
    let n = this.ipcs.nMapping //getMappedBinPcs().length;
    // initial view
    this.drawsMusaic()
  }

  drawsMusaic() {

    let w = this.containerCanvas.nativeElement.clientWidth ?? 40
    let n = this.ipcs.nMapping //getMappedBinPcs().length;

    let CEL_WIDTH =  Math.floor(w / (n + 1));
    w = CEL_WIDTH * (n+1)
    // dimension of musaic match with cell size
    // square (n+1) x (n+1)

    this.canvas.nativeElement.width = w
    this.canvas.nativeElement.height = w

    let ctx = this.context
    ctx.strokeStyle = "black";

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
        if (this.ipcs.getMappedBinPcs()[(i + pivotMapped  + j * 5) % n] === 1) {
          ctx.fillStyle = "black";
          ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH); // or not stroke ?

        } else {
          if (this.opaque) {
            ctx.fillStyle = "white";
            ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
            ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          }
        }
      }
    }
    ctx.strokeRect(0, 0,
      this.canvas.nativeElement!.parentElement!.clientWidth-1,
      this.canvas.nativeElement!.parentElement!.clientWidth-1);

    this.CEL_WIDTH = CEL_WIDTH;
  }

}
