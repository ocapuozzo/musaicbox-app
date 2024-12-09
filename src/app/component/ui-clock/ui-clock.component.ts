import {Component, ElementRef, HostListener, NgZone, Renderer2, ViewChild} from '@angular/core';
import {IPcs} from "../../core/IPcs";
import {ClockDrawing} from "../../ui/ClockDrawing";
import {ScoreNotationComponent} from "../score-notation/score-notation.component";
import {
  ModulationTranslationControlComponent
} from "../modulation-translation-control/modulation-translation-control.component";
import {ManagerPagePcsService} from "../../service/manager-page-pcs.service";
import {ManagerPagePcsListService} from "../../service/manager-page-pcs-list.service";
import {AnalyseChord} from "../../utils/AnalyseChord";
import {NgForOf, NgIf} from "@angular/common";
import {ChordNaming} from "../../core/ChordNaming";
import {Scales2048Name} from "../../core/Scales2048Name";
import {INameDefLink} from "../../core/IScaleName";
import {BreakpointObserver} from "@angular/cdk/layout";
import {AnimPitchService, IPitchPlaying} from "../../service/anim-pitch.service";

@Component({
  selector: 'app-ui-clock',
  standalone: true,
  imports: [
    ScoreNotationComponent,
    ModulationTranslationControlComponent,
    NgForOf,
    NgIf
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

  private _pcs: IPcs

  pcsFirstScaleNameOrDerived: INameDefLink
  indexPlaying: number = -1


  private unlisten = () => {
  }; // Function

  /**
   * draw canvas when pcsList change
   *
   * @param value newPcs
   */
  set pcs(value: IPcs) {
    this._pcs = value
    this.pcsFirstScaleNameOrDerived = this._pcs.getFirstScaleNameOrDerived()
    if (this.context) {
      this.drawClock()
    }
  }

  get pcs(): IPcs {
    return this._pcs
  }

  constructor(
    private managerPagePcsService: ManagerPagePcsService,
    private managerPagePcsListService: ManagerPagePcsListService,
    private managerAnimPitchService: AnimPitchService,
    private ngZone: NgZone,
    private renderer2: Renderer2,
    private responsive: BreakpointObserver) {

    this.managerPagePcsService.updatePcsEvent.subscribe((pcs: IPcs) => {
      this.indexPlaying = -1
      this.pcs = pcs
    })

    this.managerAnimPitchService.eventNotePlaying.subscribe((pitchPlaying: IPitchPlaying) => {
      if (pitchPlaying.indexPitchPlaying === -1) {
        this.indexPlaying = -1
      } else if (pitchPlaying.idPcs === this.pcs.id) {
        this.indexPlaying = pitchPlaying.indexPitchPlaying
        // console.log("event in ui-clock, index playing : ", this.indexPlaying)
      } else {
        this.indexPlaying = -1
      }
      this.updateGraphicContext()
      this.drawClock()
    })

    this.pcs = this.managerPagePcsService.pcs
  }

  ngAfterViewInit() {
    this.updateGraphicContext()
    this.setupEvents();
    this.drawClock()
  }

  ngOnInit() {
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    // console.log("resize")
    this.doUpdateGraphics()
  }

  doUpdateGraphics() {
    this.updateGraphicContext()
    this.managerPagePcsService.refresh()
  }

  updateGraphicContext() {
    // @ts-ignore
    this.context = this.canvas.nativeElement.getContext('2d');

    let len = Math.min(this.containerCanvas.nativeElement.clientWidth, this.containerCanvas.nativeElement.clientHeight)

    this.canvas.nativeElement.width = len
    this.canvas.nativeElement.height = len // square

    this.clockDrawing = new ClockDrawing({
      ipcs: this.managerPagePcsService.pcs,
      ctx: this.context,
      width: len,
      height: len, // square
      pc_color_fill: "yellow",
      segmentsLineDash: [[1, 2, 2, 1], [2, 3]], // median, inter,
      indexPlaying: this.indexPlaying
    })
  }

  ngOnDestroy() {
    this.unlisten()
  }

  private setupEvents(): void {
    this.canvas.nativeElement.addEventListener('mouseup',
      (event) => this.mouseup(event));
    this.canvas.nativeElement.addEventListener('mousedown',
      (event) => this.mousedown(event));

    this.canvas.nativeElement.addEventListener('touchstart',
      (event) => this.touchstart(event), {passive: true});

    this.canvas.nativeElement.addEventListener('touchend',
      (event) => this.touchend(event), false);

    // // right click => selected index ?
    this.canvas.nativeElement.addEventListener('contextmenu',
      (event) => this.mouseup(event));

    // this.canvas.nativeElement.addEventListener('mousemove',
    //   (event) => this.mouseMoveSetCursor(event));
    // too much refresh display, so put event mousemove outside angular zone
    // https://medium.com/javascript-everyday/adding-event-listeners-outside-of-the-angular-zone-a22f9cfc80eb
    this.ngZone.runOutsideAngular(() => {
      this.unlisten = this.renderer2.listen(
        this.canvas.nativeElement,
        'mousemove',
        (e) => this.mouseMoveSetCursor(e)
      );
    });
  }

  mouseMoveSetCursor(e: MouseEvent) {
    // https://developer.mozilla.org/fr/docs/Web/API/MouseEvent
    let index = this.getIndexSelectedFromUIClock(e);
    if (index >= 0) {
      this.canvas.nativeElement.style.cursor =
        this.pcs.templateMappingBinPcs.includes(index) ? 'pointer' : 'not-allowed'
    } else {
      this.canvas.nativeElement.style.cursor = 'default'
    }
  }

  mousedown(e: MouseEvent) {
    this.dateMouseDone = new Date()
  }

  mouseup(e: any) {
    e.preventDefault();
    // see https://developer.mozilla.org/en-US/docs/Web/API/Element/auxclick_event ?
    // https://stackoverflow.com/questions/56260646/how-can-i-handle-the-angular-click-event-for-the-middle-mouse-button

    let index = this.getIndexSelectedFromUIClock(e);
    index = this.pcs.indexMappedToIndexInner(index)

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
    // index = this.pcs.indexMappedToIndexInner(index)
    // right click and long click => change iPivot
    if (isRightMB || longClick) {
      if (index !== this.getIPivot()) {
        this.managerPagePcsService.toggleIndexOrSetIPivot(index)
      }
      this.dateMouseDone = undefined
      return;
    }

    // accept unset iPivot when cardinal == 1 only
    if (index >= 0 && (index !== this.getIPivot() || this.pcs.cardinal === 1)) {
      this.managerPagePcsService.toggleIndex(index)
    }
  }

  public getIPivot(): number | undefined {
    return this.pcs.iPivot
  }

  public setIPivot(newPivot: number) {
    if (newPivot < this.pcs.n && newPivot >= 0) {
      this.managerPagePcsService.toggleIndexOrSetIPivot(newPivot)
    } else {
      throw new Error("Invalid iPivot")
    }
  }

  getCardinal() {
    return this.pcs.n
  }

  updateClockDrawing() {
    let len = Math.min(this.containerCanvas.nativeElement.clientWidth, this.containerCanvas.nativeElement.clientHeight)
    this.canvas.nativeElement.width = len
    this.canvas.nativeElement.height = len // square

    this.clockDrawing = new ClockDrawing(
      {
        ipcs: this.pcs,
        ctx: this.context,
        width: len,
        height: len,
        pc_color_fill: "yellow",
        segmentsLineDash: [[1, 2, 2, 1], [2, 3]], // median, inter,
        indexPlaying: this.indexPlaying
      })
  }

  getIndexSelectedFromUIClock(e: any) {
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
    return this.clockDrawing.getIndexPitchFromXY(x1, y1);
  }

  isSelected(i: number): boolean {
    return this.pcs.getMappedBinPcs()[i] === 1;
  }

  touchstart(e: TouchEvent | MouseEvent) {
    if (e) {
      // e.preventDefault();
    }
    this.dateMouseDone = new Date()
  }

  touchend(e: TouchEvent) {
    if (!e) {
      return
    }
    e.preventDefault();

    let index = this.getIndexSelectedFromUIClock(e);
    index = this.pcs.indexMappedToIndexInner(index)

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
        this.managerPagePcsService.toggleIndexOrSetIPivot(index)
      } else {
        this.managerPagePcsService.toggleIndex(index)
      }
    }
  }

  drawClock() {
    this.updateClockDrawing()
    this.clockDrawing.draw(this.pcs)
  }

  /**
   * In n, Translation "T-1" or "T+1" or Modulation "M-1" or "M+1"
   * @param $event
   */
  changePcsFromModuleTranslationControl($event: string) {
    if ($event.startsWith('T')) {
      this.managerPagePcsService.translateByM1Tx($event == 'T-1' ? -1 : +1)
    } else { // M
      this.managerPagePcsService.modulation($event == 'M-1' ? IPcs.PREV_DEGREE : IPcs.NEXT_DEGREE)
    }
    // this.drawClock()
    // this.changePcs.emit(this.pcsList)
  }

  autoMap() {
    this.managerPagePcsService.autoMap()
  }

  unMap() {
    this.managerPagePcsService.unMap()
  }

  addToList() {
    this.managerPagePcsListService.addPcs('', this.pcs)
  }

  threeChordList() {
    if (this.managerPagePcsListService.isAlreadyCompute3Chords(this.pcs.id)) return

    const list3Chords = AnalyseChord.getListChords(this.pcs, 3)
    for (const list3Chord of list3Chords) {
      if (list3Chord[1].length == 0) {
        this.managerPagePcsListService.addPcs(list3Chord[0], null)
      } else for (let i = 0; i < list3Chord[1].length; i++) {
        this.managerPagePcsListService.addPcs(list3Chord[0], list3Chord[1][i], true)
      }
    }
    // for not repeat this generation of chords
    this.managerPagePcsListService.addCompute3Chords(this.pcs.id)
  }

  fourChordList() {
    if (this.managerPagePcsListService.isAlreadyCompute4Chords(this.pcs.id)) return

    const listSeventhChords = AnalyseChord.getListChords(this.pcs, 4)
    for (const fourChord of listSeventhChords) {
      if (fourChord[1].length == 0) {
        this.managerPagePcsListService.addPcs(fourChord[0], null, true)
      } else for (let i = 0; i < fourChord[1].length; i++) {
        this.managerPagePcsListService.addPcs(fourChord[0], fourChord[1][i], true)
      }
    }
    // for not repeat this generation of chords
    this.managerPagePcsListService.addCompute4Chords(this.pcs.id)
  }

  protected readonly ChordName = ChordNaming;
  protected readonly PcsNaming = ChordNaming;
  protected readonly Scales2048Name = Scales2048Name;

  getLinkName() {
    return Scales2048Name.getScale2048Name(this.pcs).sources[0]
  }

  getLinksNameDefs(): INameDefLink[] {
    return Scales2048Name.getLinksNameDefs(this.pcs)
  }
}
