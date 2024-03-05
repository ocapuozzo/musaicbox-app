import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ISortedOrbits} from "../../core/ISortedOrbits";
import {NgIf, NgStyle} from "@angular/common";
import {MusaicComponent} from "../musaic/musaic.component";
import {ClockComponent} from "../clock/clock.component";
import {IPcs} from "../../core/IPcs";
import {ManagerHomePcsService} from "../../service/manager-home-pcs.service";
import {Router} from "@angular/router";
import {ManagerExplorerService} from "../../service/manager-explorer.service";

@Component({
  selector: 'app-orbit',
  standalone: true,
  imports: [
    NgIf,
    MusaicComponent,
    ClockComponent,
    NgStyle,
  ],
  templateUrl: './ui-orbit.component.html',
  styleUrl: './ui-orbit.component.css'
})
export class UiOrbitComponent {

  @Input() orbitsGroup: ISortedOrbits | null = null

  viewMusaic: boolean = false
  textButtonViewMusaicClock : string = "View Musaic"
  pcColorSet : string = 'black'
  pivotColor: string = 'black';

  ngOnInit() {
  }

  constructor(private readonly  managerHomePcsService : ManagerHomePcsService,
              private readonly managerExplorerService : ManagerExplorerService,
              private readonly router: Router) {}

  //
  // detectRightMouseClick($event: any, pcs:IPcs) {
  //   if ($event.which === 3) {
  //     this.contextMenuStyle = {
  //       'display' : 'block',
  //       'position' : 'absolute',
  //       'left.x' : $event.offsetX,
  //       'left.y' : $event.offsetY
  //     }
  //     this.currentPcs = pcs
  //   }
  // }

  changeViewIPcs() {
    this.viewMusaic = !this.viewMusaic;
    this.textButtonViewMusaicClock = this.viewMusaic  ?  "View Clock" : "View Musaic"
  }

  doPushToHomePage(pcs: IPcs) {
    this.managerHomePcsService.replaceBy(pcs)
    this.managerExplorerService.doSaveConfig()
    this.router.navigateByUrl('/home');
  }


  // //activates the menu with the coordinates
  // onrightClick(event: any) {
  //    console.log('onrightClick !')
  //   this.contextmenuX = event.clientX
  //   this.contextmenuY = event.clientY
  //   this.contextmenu = true;
  // }
  //disables the menu
  // closeContextMenu() {
  //   this.contextMenuStyle = {
  //     'display': 'none'
  //   };
  // }
  //
  // public onContextMenu(event: MouseEvent, pcs: IPcs): void {
  //   console.log('onContextMenu !')
  //   console.log('clic droit sur : ' + pcs.getMappedPcsStr())
  //   this._contextmenuService.showContextMenu(event, this._items);
  // }

  public _onContextMenu(event: MouseEvent, pcs: IPcs): void {
    event.preventDefault();
    console.log('clic droit sur : ' + pcs.getMappedPcsStr())
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
      contextMenu.style.top = `${event.offsetY}px`;
      contextMenu.style.left = `${event.offsetX}px`;
      contextMenu.classList.add('show');

      // Gérer les événements du menu contextuel

      contextMenu.addEventListener('click', (event: MouseEvent) => {
        contextMenu.classList.remove('show');
        // Traiter l'action du menu en fonction de l'élément cliqué
      });

      document.addEventListener('click', () => {
        contextMenu.classList.remove('show');
      });
    }
  }

  public doSomething(): void {
    console.log('Option 1 clicked');
  }

  public doSomethingElse(): void {
    console.log('Option 2 clicked');
  }

  // public log(event: any) {
  //   this.mousePosition = `Mouse X: ${event.x},  Mouse Y: ${event.y}`;
  //   //
  //   //this.undiv.nativeElement.style.top = event.y
  //   this.undiv.nativeElement.style.left = event.x + 50
  // }
}
