import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ManagerHomePcsService} from "../../service/manager-home-pcs.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-ui-musaic',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './ui-musaic.component.html',
  styleUrl: './ui-musaic.component.css'
})
export class UiMusaicComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('containercanvas', {static: false}) containerCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('m11', {static: false}) m11: ElementRef<HTMLButtonElement>;
  @ViewChild('m5', {static: false}) m5: ElementRef<HTMLButtonElement>;
  @ViewChild('m7', {static: false}) m7: ElementRef<HTMLButtonElement>;

  private context: CanvasRenderingContext2D;
  private isDisableButtons: boolean = false
  private CEL_WIDTH : number = 10

  @Input() ipcs: IPcs //= new IPcs({strPcs: "0,3,6,9"})
  @Output() changePcsEvent = new EventEmitter<IPcs>();

  constructor(private managerHomePcsService : ManagerHomePcsService) {
    this.ipcs = this.managerHomePcsService.pcs
  }

  ngAfterViewInit() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');
    this.containerCanvas.nativeElement.addEventListener("animationend",
      (event) => this.listenerEndAnim(event));

    this.canvas.nativeElement.addEventListener('mouseup',
      (event) => this.mouseup(event));

    this.canvas.nativeElement.addEventListener('mousemove',
      (event) => this.mouseMoveSetCursor(event));

    // send by manager-home-pcs.service
    this.managerHomePcsService.updatePcs.subscribe( (pcs: IPcs) => {
      this.ipcs = pcs
      this.drawsMusaic()
    })

    // initial view
    this.drawsMusaic()
  }

  /**
   * After geometrical transformation, set pcs transformation
   * (algebric) and draw its musaic representation (geometric)
   * so, no change visualy if ok !
   */
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
    //   ipcs : ({0, 3, 6, 9}, iPivot=0)
    //   ipcs : ({1, 4, 7, 10}, iPivot=1)
    // are same IS, are same Musaic representation
    // let iPivot = this.ipcs.iPivot ?? 0
    const pivotMapped = this.ipcs.templateMappingBinPcs[this.ipcs.iPivot ?? 0]
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        if (this.ipcs.getMappedBinPcs()[(i + pivotMapped  + j * 5) % n] === 1) {
          ctx.fillStyle = "black";
          ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
        //  ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);

        } else {
          ctx.fillStyle = "white";
          ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
        }
      }
    }
    ctx.strokeRect(0, 0,
      this.canvas.nativeElement!.parentElement!.clientWidth,
      this.canvas.nativeElement!.parentElement!.clientWidth);

    this.CEL_WIDTH = CEL_WIDTH;
  }

  fromMatrixToIndexVector(e: any) : number {

    let rect = this.canvas.nativeElement.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // for compute with undefined
    let localPivot = (this.ipcs.iPivot === undefined) ? 0 : this.ipcs.iPivot

    // from matrix coord to indice linear (for matrix armature 1 x 5)
    return ((5 * Math.floor(x / this.CEL_WIDTH))
      + (Math.floor(y / this.CEL_WIDTH)) + localPivot) % this.ipcs.nMapping
  }

  /**
   * Adapt cursor for select cell compatible with mapping
   * @param e
   */
  mouseMoveSetCursor(e:any) {
    if (this.canvas == undefined) return
    let index = this.fromMatrixToIndexVector(e)
    this.canvas.nativeElement.style.cursor =
      this.ipcs.templateMappingBinPcs.includes(index) ? 'pointer' : 'not-allowed'
  }
  mouseup(e: any) {
    let index = this.fromMatrixToIndexVector(e)

    // only select PCS in templateMappingBinPcs
    if (! this.ipcs.templateMappingBinPcs.includes(index)) {
      return;
    }

    // keep iPivot until cardinal = 1
    if (index !== this.ipcs.iPivot || this.ipcs.cardinal===1) {
      this.managerHomePcsService.toggleIndex(index)
    }
  }

  /**
   * return true is a cursor is on "wait" (m11 ou m5 or m7)
   */
  isCursorWait() {
    return this.m11.nativeElement.style.cursor === "wait";
  }

  m11Click() {
    if (this.isCursorWait()) return;

    this.disableButtons();
    this.canvas.nativeElement.classList.add("rotateM11");
  };

  m5Click() {
    if (this.isCursorWait()) return;

    this.disableButtons();
    this.canvas.nativeElement.classList.add("rotateM5");
  };

  m7Click() {
    if (this.isCursorWait()) return;

    this.disableButtons();
    this.canvas.nativeElement.classList.add("rotateM7");
  };

  complement() {
    this.managerHomePcsService.complement()
  }

  disableButtons() {
    this.isDisableButtons = true
    this.m11.nativeElement.disabled = true
    this.m11.nativeElement.style.cursor = "wait";
    this.m5.nativeElement.style.cursor = "wait";
    this.m7.nativeElement.style.cursor = "wait";
  }

  enabledButtons() {
    this.m11.nativeElement.style.cursor = "pointer";
    this.m5.nativeElement.style.cursor = "pointer";
    this.m7.nativeElement.style.cursor = "pointer";
    this.isDisableButtons = false
    this.m11.nativeElement.disabled = false
  }

  clearRotateClasses() {
    if (this.canvas.nativeElement.classList.contains("rotateM11"))
      this.canvas.nativeElement.classList.remove("rotateM11");
    if (this.canvas.nativeElement.classList.contains("rotateM5"))
      this.canvas.nativeElement.classList.remove("rotateM5");
    if (this.canvas.nativeElement.classList.contains("rotateM7"))
      this.canvas.nativeElement.classList.remove("rotateM7");
  }

  /**
   * (After geometric operation) select algebraic operation and call
   *  transformsPcsAndDrawsMusaic()
   */
  listenerEndAnim(event : any) {
    //  console.log("event.animationName:" + event.animationName)
    let opTransf;
    if (event.target.classList.contains("rotateM11")) {
      opTransf = 11;
    } else if (event.target.classList.contains("rotateM5")) {
      opTransf = 5;
    } else if (event.target.classList.contains("rotateM7")) {
      opTransf = 7;
    } else {
      // no transformation = id operation
      opTransf = 1;//this.opId;
    }
    // send to listeners new pcs (or not...)
    // clear css class
    this.clearRotateClasses();

    // The geometric transformation is finished, and we have determined
    // the algebraic transformation operation (opTransformation) that exactly
    // matches the geometrical transformation.
    //
    // Now we perform the algebraic operation to replaceBy the
    // transformed musaic with its transform (and delete its
    // class css from the past operation)
    this.managerHomePcsService.transformeByMxT0(opTransf)
    this.enabledButtons();

  }

}
