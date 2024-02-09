import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-module-translation-control',
  standalone: true,
  imports: [],
  templateUrl: './module-translation-control.component.html',
  styleUrl: './module-translation-control.component.css'
})
export class ModuleTranslationControlComponent {
  @Output() changePcsEvent = new EventEmitter<string>();

  ngAfterViewInit() {

  }

  onTranslate(direction: string) : void{
    this.changePcsEvent.emit("T" + direction)
  }

  onChangeDegree(direction: string) : void{
    this.changePcsEvent.emit("M" + direction)
  }


}
