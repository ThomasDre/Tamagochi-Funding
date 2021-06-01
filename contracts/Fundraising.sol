// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Fundraising {

    address public owner;               // admin
    address public fundraisingHead;     // organisation that is allowed to run this fundraising contract


    /**
        TODO:
        - sell a tamagochi for each board (fundraisingHead can set the price)
        - publish weekly events (fundraising)
        - participate in events (tamagochi owner)

     */
    
    constructor() {
        // owner of board is also the owner of individual fundraising
        owner = tx.origin;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner is permitted!");
        _;
    }

    function setFundraisingHead(address head) public onlyOwner {
        fundraisingHead = head;
    }



    function deactivate() external onlyOwner {
        // DESIGN DECISION: who gets the fund upon deactivation (community or board owner?)
        selfdestruct(payable(fundraisingHead));
    }

}