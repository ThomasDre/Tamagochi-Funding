import { Component, OnInit } from '@angular/core';
import {ContractsService } from '../../services';

@Component({
  selector: 'app-fundraising-overview',
  templateUrl: './fundraising-overview.component.html',
  styleUrls: ['./fundraising-overview.component.css']
})
export class FundraisingOverviewComponent implements OnInit {

  fundraisingBoards: [];

  constructor(private contractsService: ContractsService) { }

  ngOnInit(): void {
    this.fundraisingBoards = this.contractsService.getFundraisingBoards();
  }


}
