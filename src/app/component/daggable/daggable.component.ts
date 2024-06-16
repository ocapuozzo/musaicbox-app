import {Component, Renderer2} from '@angular/core';

@Component({
  selector: 'app-daggable',
  standalone: true,
  imports: [],
  templateUrl: './daggable.component.html',
  styleUrl: './daggable.component.css'
})
export class DaggableComponent {

  constructor(  private renderer2: Renderer2) {

  }
  // see uiClock
  // private setupEvents(){
  //   this.ngZone.runOutsideAngular(() => {
  //     this.unlisten = this.renderer2.listen(
  //       this.canvas.nativeElement,
  //       'mousemove',
  //       (e) => this.mouseMoveSetCursor(e)
  //     );
  //   });
  // }

}
