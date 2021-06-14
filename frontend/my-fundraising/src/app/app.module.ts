import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app-entry/app.component';
import { AdminBoardComponent } from './components/admin-board/admin-board.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { LoadContractComponent } from './components/load-contract/load-contract.component';
import { FundraisingOverviewComponent } from './components/fundraising-overview/fundraising-overview.component';
import { PartiesOverviewComponent } from './components/parties-overview/parties-overview.component';
import { AccountSelectionComponent } from './components/account-selection/account-selection.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminBoardComponent,
    NavigationComponent,
    LoadContractComponent,
    FundraisingOverviewComponent,
    PartiesOverviewComponent,
    AccountSelectionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
