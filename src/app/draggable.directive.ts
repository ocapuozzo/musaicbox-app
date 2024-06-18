import {Directive, ElementRef, HostListener, Input, NgZone, Renderer2} from '@angular/core';
import {UIPcsDto} from "./ui/UIPcsDto";

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {

  isDown = false
  offset : number[] = []
  private unlisten  = () => {};

  @Input() draggable : UIPcsDto = new UIPcsDto();

  constructor(private el: ElementRef,
              private ngZone: NgZone,
              private renderer2: Renderer2) {

    this.el.nativeElement.addEventListener('mousedown',
      (event: MouseEvent) => this.onMouseDown(event));
    this.el.nativeElement.addEventListener('mouseup',
      (event: MouseEvent) => this.onMouseUp(event));
    this.ngZone.runOutsideAngular(() => {
      this.unlisten = this.renderer2.listen(
        this.el.nativeElement,
        'mousemove',
        (e) => this.onMouseMove(e)
      );
    });
  }
  ngOnDestroy() {
    // remove listener
    this.unlisten();
  }
  onMouseDown(e:MouseEvent) {
    // console.log("this.el.nativeElement.style = ", this.el.nativeElement.style)
    if (!e) return
    this.isDown = true;
    this.offset = [
      this.el.nativeElement.offsetLeft - e.clientX,
      this.el.nativeElement.offsetTop - e.clientY
    ];
    // console.log("mousedown = ", this.offset)
  }

  // @HostListener('mouseup')
  onMouseUp(e:MouseEvent) {
    this.isDown = false;
    this.draggable.position.x = parseInt(this.el.nativeElement.style.left,10)
    this.draggable.position.y = parseInt(this.el.nativeElement.style.top, 10)
    // console.log("this.draggable.position = ", this.draggable.position)
  }

  // @HostListener('mousemove')
  onMouseMove(e:MouseEvent) {
    if (!e) return
    e.preventDefault();
    if (this.isDown) {
      let mousePosition = {
        x : e.clientX,
        y : e.clientY
      };
      this.el.nativeElement.style.left = (mousePosition.x + this.offset[0]) + 'px';
      this.el.nativeElement.style.top  = (mousePosition.y + this.offset[1]) + 'px';
      // console.log("this.el.nativeElement.style.left = ", this.el.nativeElement.style.left)
    }
  }

  onMouseLeave(e: MouseEvent){
    this.isDown = false
  }

  //
  // @HostListener('mouseleave') onMouseLeave() {
  //   this.highlight('');
  // }
  //
  // private highlight(color: string) {
  //   this.el.nativeElement.style.backgroundColor = color;
  // }


}
