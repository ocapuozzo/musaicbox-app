import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-module-translation-control',
  standalone: true,
  imports: [],
  templateUrl: './modulation-translation-control.component.html',
  styleUrl: './modulation-translation-control.component.css'
})
export class ModulationTranslationControlComponent {
  @Output() changePcsEvent = new EventEmitter<string>();

  ngAfterViewInit() {

  }

  onTranslate(direction: string) : void{
    this.changePcsEvent.emit("T" + direction)
  }

  onChangePivot(direction: string) : void{
    this.changePcsEvent.emit("M" + direction)
  }


}
