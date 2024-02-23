import {ManagerHomePcsService} from "../../service/manager-home-pcs.service";

import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {IPcs} from "../../core/IPcs";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  checkoutForm = this.formBuilder.group({
    pcsStr: ''
  });

  constructor(private formBuilder: FormBuilder,
              private managerHomePcsService: ManagerHomePcsService) {
  }

  onSubmit(): void {
    console.log('pscStr = ', this.checkoutForm.value.pcsStr?.trim());
    if (this.checkoutForm.value.pcsStr) {
      try {
        let pcsString = this.checkoutForm.value.pcsStr ?? ''
        if (pcsString !== undefined) {
          let pcs = new IPcs({strPcs: pcsString})
          if (pcs.cardinal > 0) {
            this.checkoutForm.reset();
            this.managerHomePcsService.replaceBy(pcs)
          }
        }
      } catch (e: any) {
        //
      }
    }

  }
}
