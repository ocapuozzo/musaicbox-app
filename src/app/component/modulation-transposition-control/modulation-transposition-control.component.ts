import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-module-transposition-control',
  standalone: true,
  imports: [],
  templateUrl: './modulation-transposition-control.component.html',
  styleUrl: './modulation-transposition-control.component.css'
})
export class ModulationTranspositionControlComponent {
  @Output() changePcsEvent = new EventEmitter<string>();

  ngAfterViewInit() {

  }

  onTranspose(direction: string) : void{
    this.changePcsEvent.emit("T" + direction)
  }

  onChangePivot(direction: string) : void{
    this.changePcsEvent.emit("M" + direction)
  }


}
