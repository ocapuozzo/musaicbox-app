import { Component } from '@angular/core';

import {ClockComponent} from "../../component/clock/clock.component";
import {UiclockComponent} from "../../component/uiclock/uiclock.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ClockComponent,
    UiclockComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
