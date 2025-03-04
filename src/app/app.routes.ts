import {Routes} from '@angular/router';
import {PcsPageComponent} from "./page/pcs/pcs-page.component";
import {GroupExplorerComponent} from "./page/group-explorer/group-explorer.component";
import {The88Component} from "./page/the88/the88.component";
import {WhiteboardComponent} from "./page/whiteboard/whiteboard.component";

export const routes: Routes = [
  {path: '', component: PcsPageComponent},
  {path: 'pcs', component: PcsPageComponent  },
  {path: 'pcs/pid/:pid', component: PcsPageComponent},
  {path: 'group-explorer', component: GroupExplorerComponent},
  {path: 'the88', component: The88Component},
  {path: 'w-board', component: WhiteboardComponent},
  {
    path: '**',
    redirectTo: 'pcs',
    pathMatch: 'full'
  }
  // {path: '**', component: PageNotFoundComponent }
];
