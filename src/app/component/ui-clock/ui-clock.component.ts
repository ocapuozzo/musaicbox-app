import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ClockDrawing} from "../../ui/ClockDrawing";
import {MusicNotationComponent} from "../music-notation/music-notation.component";
import {ModulationTranslationControlComponent} from "../modulation-translation-control/modulation-translation-control.component";
import {ManagerHomePcsService} from "../../service/manager-home-pcs.service";

@Component({
  selector: 'app-ui-clock',
  standalone: true,
  imports: [
    MusicNotationComponent,
    ModulationTranslationControlComponent
  ],
  templateUrl: './ui-clock.component.html',
  styleUrl: './ui-clock.component.css'
})
export class UiClockComponent {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('containercanvas', {static: false}) containerCanvas: ElementRef<HTMLCanvasElement>;
  dateMouseDone ?: Date = undefined
  touchendOk: boolean = false
  private context: CanvasRenderingContext2D;
  private clockDrawing: ClockDrawing;

  private _ipcs: IPcs

  @Output() changePcs = new EventEmitter<IPcs>();

  @Input() set ipcs(value : IPcs) {
    this._ipcs = value
    if (this.context) {
       this.drawClock()
    }
  }
  get ipcs() : IPcs {
    return this._ipcs
  }

  constructor(private managerHomePcsService : ManagerHomePcsService) {
    this.managerHomePcsService.updatePcs.subscribe( (pcs: IPcs) => {
      this.ipcs = pcs
    })
    this.ipcs = this.managerHomePcsService.pcs
  }


  ngAfterViewInit() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let len = Math.min(this.containerCanvas.nativeElement.clientWidth, this.containerCanvas.nativeElement.clientHeight)

    this.canvas.nativeElement.width = len
    this.canvas.nativeElement.height = len // square

    this.clockDrawing = new ClockDrawing( {
      ipcs: this.managerHomePcsService.pcs,
      ctx: this.context,
      width: len,
      height: len, // square
      pc_color : "yellow",
      segmentsLineDash : [ [1, 2, 2, 1], [2, 3] ] // median, inter
    })

    this.setupEvents();
    this.drawClock()
  }

  ngOnInit() {
    // synchrone with pcs into service
    this.managerHomePcsService.refresh()
  }

  private setupEvents(): void {
    this.canvas.nativeElement.addEventListener('mouseup',
      (event) => this.mouseup(event));
    this.canvas.nativeElement.addEventListener('mousedown',
      (event) => this.mousedown(event));
    this.canvas.nativeElement.addEventListener('mousemove',
      (event) => this.mousemove(event));
    this.canvas.nativeElement.addEventListener('touchstart',
      (event) => this.touchstart(event), false);
    this.canvas.nativeElement.addEventListener('touchend',
      (event) => this.touchend(event), false);

    // // right click => selected index ?
    this.canvas.nativeElement.addEventListener('contextmenu',
      (event) => this.mouseup(event));

  }

  mousemove(e: any) {
    // https://developer.mozilla.org/fr/docs/Web/API/MouseEvent
    let index = this.getSelected(e);
    if (index >= 0) {
      this.canvas.nativeElement.style.cursor = 'pointer'
      // console.log('mouse move : index/pitch selected = ' + index)
    } else {
      this.canvas.nativeElement.style.cursor = 'default'
    }
  }
  mousedown(e:any) {
    this.dateMouseDone = new Date()
  }
  mouseup(e: any) {
    e.preventDefault();

    let index = this.getSelected(e);
    if (index < 0 || this.touchendOk) {
      this.touchendOk = false
      return;
    }

    // https://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event
    let isRightMB = false;
    e = e || window.Event;
    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      isRightMB = e.which === 3;
    else if ("button" in e)  // IE, Opera
      isRightMB = e.button === 2;

    // long click ? (if down is 1 second or more)
    // @ts-ignore
    let longClick = (new Date() - this.dateMouseDone) >= 1000

    // console.log("index :" + index + " this.getIPivot() :" +this.getIPivot())

    // right click and long click => change iPivot
    if (isRightMB || longClick) {
      if (index !== this.getIPivot()) {
        this.managerHomePcsService.toggleIndexOrSetIPivot(index)
      }
      this.dateMouseDone = undefined
      return;
    }

    // accept unset iPivot when cardinal == 1 only
    if (index >= 0 && (index !== this.getIPivot() || this.ipcs.cardinal === 1)) {
      this.managerHomePcsService.toggleIndex(index)
    }
  }

  public getIPivot(): number | undefined {
    return this.ipcs.iPivot
  }

  public setIPivot(newPivot: number) {
    if (newPivot < this.ipcs.n && newPivot >= 0) {
      this.managerHomePcsService.toggleIndexOrSetIPivot(newPivot)
      // this.ipcs = new IPcs({strPcs: this.ipcs.getPcsStr(), iPivot: newPivot})
     // this.drawClock()
    } else {
      throw new Error("Invalid iPivot")
    }
  }

  getCardinal() {
    return this.ipcs.n
  }

  checkClockDrawing() {
    if (!this.clockDrawing) {
      let len =  Math.min(this.context.canvas.clientWidth, this.context.canvas.clientHeight)
      this.clockDrawing = new ClockDrawing(
        {
          ipcs: this.ipcs,
          ctx: this.context,
          width: len,
          height: len,
          pc_color: "yellow",
          segmentsLineDash: [[1, 2, 2, 1], [2, 3]] // median, inter
        })
    }
  }

  getSelected(e: any) {
    // const ctx = this.provider.context;
    let canvas = this.context.canvas;
    let rect = canvas.getBoundingClientRect();
    let x1 = 0
    let y1 = 0;
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch/clientX
    if ("changedTouches" in e && e.changedTouches) {
      // @ts-ignore
      x1 = e.changedTouches[0].clientX - rect.left;
      // @ts-ignore
      y1 = Math.round(e.changedTouches[0].clientY - rect.top);
    } else {
      if ("clientX" in e) {
        x1 = e.clientX - rect.left;
        y1 = Math.round(e.clientY - rect.top);
      }
    }
    this.checkClockDrawing();
    return this.clockDrawing.getIndexPitchFromXY(x1, y1);
  }

  isSelected(i: number): boolean {
    return this.ipcs.getMappedBinPcs()[i] === 1;
  }

  touchstart(e: TouchEvent | MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    this.dateMouseDone = new Date()
  }

  touchend(e: TouchEvent) {
    if (!e) {
      return
    }
    e.preventDefault();

    let index = this.getSelected(e);

    if (index < 0) {
      this.dateMouseDone = undefined
      return
    }

    // @ts-ignore
    let longClick = (new Date() - this.dateMouseDone) >= 500

    this.dateMouseDone = undefined

    if (index !== this.getIPivot()) {
      this.touchendOk = true
      if (longClick) {
        this._changePcsBySetIndexToOneOriPivot(index)
      } else {
        // TODO why this difference in longClick...
        this._changePcsBySetIndexToOneOriPivot(index)
        // this.$store.commit("ipcs/toggleindexpcs", index);
        // this.$root.$emit('onsetpcs');
      }
    }
  }

  _changePcsBySetIndexToOneOriPivot(index: number) {
    this.managerHomePcsService.toggleIndexOrSetIPivot(index)
  }

  drawClock() {
    this.checkClockDrawing()
    this.clockDrawing.draw(this.ipcs)
  }

  /**
   * In n, Translation "T-1" or "T+1" or Modulation "M-1" or "M+1"
   * @param $event
   */
  changePcsFromModuleTranslationControl($event: string) {
    if ($event.startsWith('T')) {
      this.managerHomePcsService.translateByM1Tx($event == 'T-1' ? -1 : +1)
    } else {
      this.managerHomePcsService.modulation($event == 'M-1' ? IPcs.PREV_MODULE : IPcs.NEXT_MODULE)
    }
    this.drawClock()
    this.changePcs.emit(this.ipcs)
  }

  autoMap() {
    this.managerHomePcsService.autoMap()
  }

  unMap() {
    this.managerHomePcsService.unMap()
  }
}
