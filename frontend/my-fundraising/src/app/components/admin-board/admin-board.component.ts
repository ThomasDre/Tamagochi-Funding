import { Component, OnInit } from '@angular/core';
import { ContractsService } from '../../services/contracts.service';
import {Requester} from '../../dto/Requester';

@Component({
  selector: 'app-admin-board',
  templateUrl: './admin-board.component.html',
  styleUrls: ['./admin-board.component.css']
})
export class AdminBoardComponent implements OnInit {

  requesters: Requester[];
  errorMsg: string;

  constructor(private contractService: ContractsService) { }

  ngOnInit(): void {
    const requester = new Requester('0x1234', 'WHO', 'www.who.org');
    this.requesters.push(requester);
  }

  addOrganisation(organisation: string, name: string): void {
    const board = this.contractService.board;
    board.methods.addOrganisation(organisation, name).estimateGas({from: this.contractService.selectedAccount}, (error, result) => {
      if (error) {
        this.errorMsg = 'Failure';
      } else {
        board.methods.addOrganisation(organisation, name).send({from: this.contractService.selectedAccount, gas: result});
      }
    });
  }

}
