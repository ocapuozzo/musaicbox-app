import { Component } from '@angular/core';

import {UiClockComponent} from "../../component/ui-clock/ui-clock.component";
import {UiMusaicComponent} from "../../component/ui-musaic/ui-musaic.component";
import {update} from "@angular-devkit/build-angular/src/tools/esbuild/angular/compilation/parallel-worker";
import {IPcs} from "../../core/IPcs";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    UiClockComponent,
    UiMusaicComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  pcs: IPcs = new IPcs({strPcs:"0,1,2,3"})
  updatePcs($event: IPcs) {
     this.pcs = new IPcs({
         binPcs: $event.abinPcs.slice(),
         iPivot: $event.iPivot,
         mappingBinPcs: $event.mappingBinPcs,
         nMapping: $event.nMapping
     })
  }
}
