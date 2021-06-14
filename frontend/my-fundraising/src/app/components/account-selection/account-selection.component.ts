import { Component, OnInit } from '@angular/core';
import {ContractsService} from '../../services/contracts.service';

@Component({
  selector: 'app-account-selection',
  templateUrl: './account-selection.component.html',
  styleUrls: ['./account-selection.component.css']
})
export class AccountSelectionComponent implements OnInit {

  selected: string;

  constructor(private contractService: ContractsService) { }

  ngOnInit(): void {
  }

  chooseAccount(): void {
    this.contractService.selectedAccount = this.selected;
  }

}
