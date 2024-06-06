import { Routes } from '@angular/router';
import { PcsComponent} from "./page/pcs/pcs.component";
import {GroupExplorerComponent} from "./page/group-explorer/group-explorer.component";
import {PageNotFoundComponent} from "./page/page-not-found/page-not-found.component";
import {The88Component} from "./page/the88/the88.component";
import {WhiteboardComponent} from "./page/whiteboard/whiteboard.component";

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'about',
  //   pathMatch: 'full'
  // }
  {path: '', component: PcsComponent},
  {path: 'pcs', component: PcsComponent},
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
