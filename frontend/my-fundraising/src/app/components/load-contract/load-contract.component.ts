import { Component, OnInit } from '@angular/core';
import {ContractsService} from './../../services';

@Component({
  selector: 'app-load-contract',
  templateUrl: './load-contract.component.html',
  styleUrls: ['./load-contract.component.css']
})
export class LoadContractComponent implements OnInit {

  constructor(private contractService: ContractsService) { }

  address: string;

  ngOnInit(): void {
  }

  loadContract(): void {
    this.contractService.initContract(this.address);
  }

}
