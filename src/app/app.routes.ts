import { Routes } from '@angular/router';
import { HomeComponent} from "./page/home/home.component";
import {GroupExplorerComponent} from "./page/group-explorer/group-explorer.component";
import {PageNotFoundComponent} from "./page/page-not-found/page-not-found.component";

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'group-explorer', component: GroupExplorerComponent},
  { path: '**', component: PageNotFoundComponent },
];
