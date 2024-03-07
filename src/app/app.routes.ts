import { Routes } from '@angular/router';
import { HomeComponent} from "./page/home/home.component";
import {GroupExplorerComponent} from "./page/group-explorer/group-explorer.component";
import {PageNotFoundComponent} from "./page/page-not-found/page-not-found.component";
import {The88Component} from "./page/the88/the88.component";

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', component: HomeComponent},
  {path: 'group-explorer', component: GroupExplorerComponent},
  {path: 'the88', component: The88Component},
  {path: '**', component: PageNotFoundComponent }
];
