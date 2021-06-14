import { Injectable } from '@angular/core';
import Web3 from 'web3';
import {boardABI, fundraisingABI, tamagochiTokenABI} from '../contracts/abis.js';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  constructor() {}

  public board;
  public token;
  public fundraising: [];

  public accounts: string[];
  public selectedAccount: string;

  async initContract(address: string): Promise<boolean> {

    // Connecting to local node
    const provider = new Web3.providers.WebsocketProvider('ws://localhost:8546');
    // tslint:disable-next-line: no-string-literal
    const web3 = window['web3'] = new Web3(provider);
    const isConnected = await web3.eth.net.isListening();
    if (!isConnected) {
        alert('Not connected to client!');
        return new Promise((resolve) => {
          resolve(false);
        });
    } else {
        console.log('Connected to client!');
    }

    this.accounts = await web3.eth.getAccounts();

    if (address != null) {
      // Check whether bar contract is deployed by checking the code deployed on that address
      const data = await web3.eth.getCode(address);
      if (data === '0x') {
          alert('No contract deployed on that address!');
          return;
      }

      // Instantiate contracts
      this.board = new web3.eth.Contract(boardABI, address);

      const tokenAddress = this.board.methods.tamagochiToken().call();
      this.token = new web3.eth.Contract(tamagochiTokenABI, tokenAddress);

      // Start event handlers
      // subscribeBlocks();
      // listenToContractEvents();

      return new Promise((resolve) => {
        resolve(true);
      });
    }
  }

  getFundraisingBoards(): [] {
    return this.board.methods.organisations().call();
  }

}
