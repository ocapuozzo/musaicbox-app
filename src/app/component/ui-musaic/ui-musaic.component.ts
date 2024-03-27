import {Component, ElementRef, EventEmitter, Input, NgZone, Output, Renderer2, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {NgClass} from "@angular/common";
import {EightyEight} from "../../utils/EightyEight";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatButton} from "@angular/material/button";

// import {fromEvent} from "rxjs";

@Component({
  selector: 'app-ui-musaic',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    MatCheckbox,
    MatButton
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
  private CEL_WIDTH: number = 10

  @Input() optionDrawPitchIndex : boolean = false

  @Input() pcs: IPcs //= new IPcs({strPcs: "0,3,6,9"})
  @Output() changePcsEvent = new EventEmitter<IPcs>()

  private unlisten: Function;

  constructor(private managerHomePcsService: ManagerPagePcsService,
              private ngZone: NgZone, private renderer: Renderer2) {
    this.pcs = this.managerHomePcsService.pcs
  }

  ngAfterViewInit() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');
    this.containerCanvas.nativeElement.addEventListener("animationend",
      (event) => this.listenerEndAnim(event));

    this.canvas.nativeElement.addEventListener('mouseup',
      (event) => this.mouseup(event));

    // const host = fromEvent(this.canvas.nativeElement,'mousemove').subscribe(c=>this.mouseMoveSetCursor(c));
    // this.canvas.nativeElement.addEventListener('mousemove',
    //   (event) => this.mouseMoveSetCursor(event));

    // https://medium.com/javascript-everyday/adding-event-listeners-outside-of-the-angular-zone-a22f9cfc80eb
    this.ngZone.runOutsideAngular(() => {
      this.unlisten = this.renderer.listen(
        this.canvas.nativeElement,
        'mousemove',
        (e) => this.mouseMoveSetCursor(e)
      );
    });

    // send by manager-home-pcs.service
    this.managerHomePcsService.updatePcs.subscribe((pcs: IPcs) => {
      this.pcs = pcs
      this.drawsMusaic(this.optionDrawPitchIndex)
    })

    // initial view
    this.drawsMusaic(this.optionDrawPitchIndex)
  }

  /**
   * After geometrical transformation, set pcs transformation
   * (algebric) and draw its musaic representation (geometric)
   * so, no change visualy if ok !
   */
  drawsMusaic(withDrawPitchIndex : boolean = false) {

    let w = this.containerCanvas.nativeElement.clientWidth ?? 40
    let n = this.pcs.nMapping //getMappedBinPcs().length;

    let CEL_WIDTH = Math.floor(w / (n + 1));
    w = CEL_WIDTH * (n + 1)
    // dimension of musaic match with cell size
    // square (n+1) x (n+1)

    this.canvas.nativeElement.width = w
    this.canvas.nativeElement.height = w
    let ctx = this.context

    ctx.save()
    ctx.strokeStyle = "black";

    // Draws musaic
    // loop n+1 for exact correlation between geometry ops and algebra ops
    // display *iPivot centered* for bijective relation geometry <-> algebra
    // Example.
    //   pcs : ({0, 3, 6, 9}, iPivot=0)
    //   pcs : ({1, 4, 7, 10}, iPivot=1)
    // are same IS, are same Musaic representation
    ctx.strokeStyle = 'black'
    const pivotMapped = this.pcs.templateMappingBinPcs[this.pcs.iPivot ?? 0]

    function drawPitch(j: number, i: number, pitch: number, color : string) {
      let x = CEL_WIDTH / 3 + j * CEL_WIDTH
      let y = CEL_WIDTH / 1.4 + i * CEL_WIDTH
      if (pitch > 9) {
        // 2 characters (10 wider than 11)
        x -= (pitch == 10) ? 3 : 2
      }
      // ctx.strokeStyle = 'white'
      ctx.fillStyle = color //'white'
      ctx.fillText(pitch.toString(), x, y, CEL_WIDTH)
      // ctx.strokeStyle = saveStrokeStyle
    }

    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const pitch = (pivotMapped + (i + j * 5)) % n
        if (this.pcs.getMappedBinPcs()[pitch] === 1) {
          ctx.strokeStyle = 'black'
          ctx.fillStyle = "black";
          ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          //  ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          if (withDrawPitchIndex) {
            drawPitch(j, i, pitch, 'white');
          }
        } else {
          ctx.fillStyle = "white";
          ctx.strokeStyle = 'black'
          ctx.fillRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          ctx.strokeRect(j * CEL_WIDTH, i * CEL_WIDTH, CEL_WIDTH, CEL_WIDTH);
          if (withDrawPitchIndex) {
            drawPitch(j, i, pitch, 'black');
          }
        }
      }
    }
    ctx.strokeStyle = 'white' //saveStrokeStyle
    ctx.strokeRect(0, 0,
      this.canvas.nativeElement!.parentElement!.clientWidth-2,
      this.canvas.nativeElement!.parentElement!.clientWidth-2);

    ctx.restore()
    this.CEL_WIDTH = CEL_WIDTH;
  }

  fromMatrixPointerToIndexVector(e: any): number {

    let rect = this.canvas.nativeElement.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // for compute with undefined
    let localPivot = (this.pcs.iPivot === undefined) ? 0 : this.pcs.iPivot

    // from matrix coord to indice linear (for matrix armature 1 x 5)
    return ((5 * Math.floor(x / this.CEL_WIDTH))
      + (Math.floor(y / this.CEL_WIDTH)) + localPivot) % this.pcs.nMapping
  }

  /**
   * Adapt cursor for select cell compatible with mapping
   * @param e
   */
  mouseMoveSetCursor(e: any) {
    if (this.canvas == undefined) return
    let index = this.fromMatrixPointerToIndexVector(e)
    const cursorPointer = this.pcs.templateMappingBinPcs.includes(index)

    // always repaint... even if style cursor not set...
    if (cursorPointer) {
      if (this.canvas.nativeElement.style.cursor != 'pointer')
        this.canvas.nativeElement.style.cursor = 'pointer'
    } else {
      if (this.canvas.nativeElement.style.cursor != 'not-allowed')
        this.canvas.nativeElement.style.cursor = 'not-allowed'
    }
    // this.canvas.nativeElement.style.cursor =
    //   this.pcs.templateMappingBinPcs.includes(index) ? 'pointer' : 'not-allowed'
  }

  mouseup(e: any) {
    let index = this.fromMatrixPointerToIndexVector(e)

    // only select PCS in templateMappingBinPcs
    if (!this.pcs.templateMappingBinPcs.includes(index)) {
      return;
    }

    // keep iPivot until cardinal = 1
    if (index !== this.pcs.iPivot || this.pcs.cardinal === 1) {
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
    if (this.optionDrawPitchIndex) {
      this.drawsMusaic(false)
    }
    this.disableButtons();
    this.canvas.nativeElement.classList.add("rotateM11");
  };

  m5Click() {
    if (this.isCursorWait()) return;
    if (this.optionDrawPitchIndex) {
      this.drawsMusaic(false)
    }
    this.disableButtons();
    this.canvas.nativeElement.classList.add("rotateM5");
  };

  m7Click() {
    if (this.isCursorWait()) return;
    if (this.optionDrawPitchIndex) {
      this.drawsMusaic(false)
    }
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
  listenerEndAnim(event: any) {
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
    this.drawsMusaic(this.optionDrawPitchIndex)
    this.enabledButtons();
  }

  protected readonly EightyEight = EightyEight;

  toggleDrawPitchesIndex(checked : boolean) {
    this.optionDrawPitchIndex = checked
    this.drawsMusaic(this.optionDrawPitchIndex)
  }

  detachPcs() {
    this.managerHomePcsService.detachPcs()
  }
}
