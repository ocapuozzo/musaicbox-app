import {Component, Input} from '@angular/core';
import {IPcs} from "../../core/IPcs";

@Component({
  selector: 'app-pcs-analysis',
  standalone: true,
  imports: [],
  templateUrl: './pcs-analysis.component.html',
  styleUrl: './pcs-analysis.component.css'
})

export class PcsAnalysisComponent {

  @Input() pcs: IPcs = new IPcs({strPcs:'[0,1,3,6,7,8]'})

  ngOnInit() {

  }
}
