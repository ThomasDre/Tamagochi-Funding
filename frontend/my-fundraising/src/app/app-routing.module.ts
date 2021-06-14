import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminBoardComponent, LoadContractComponent, FundraisingOverviewComponent, PartiesOverviewComponent } from './components';

const routes: Routes = [
  {path: '', redirectTo: '/load', pathMatch: 'full'},
  {path: 'load', component: LoadContractComponent},
  {path: 'admin', component: AdminBoardComponent},
  {path: 'fundraising', component: FundraisingOverviewComponent},
  {path: 'party', component: PartiesOverviewComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
