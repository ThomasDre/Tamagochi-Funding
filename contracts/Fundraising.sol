// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./TamagochiToken.sol";

contract Fundraising is AccessControl {

    // item represents different activities/supplies for a tamagochi
    struct Item {
        string name;
        uint price;
        uint24 food;
        uint24 care;
        uint24 entertainment;
        uint24 education;
    }

    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 private constant FUNDHEAD_ROLE = keccak256("FUNDRAISING_HEAD");     // invites employees
    bytes32 private constant ACCOUNTANT_ROLE = keccak256("ACCOUNTANT_ROLE");    // sets the prices
    bytes32 private constant BOARDMASTER_ROLE = keccak256("BOARDMASTER");       // creates events, items, etc

    address public owner;               // admin
    address public fundraisingHead;     // organisation that is allowed to run this fundraising contract

    uint public tokenPrice;
    uint public resetPrice;

    // puplished items can be used to keep a tamagochi happy and healty
    Item[] public items;

    TamagochiToken private tamagochiToken;

    
    constructor(address tokenContractAddress) {
        // owner of board is also the owner of individual fundraising
        owner = tx.origin;
        _setupRole(ADMIN_ROLE, owner);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(FUNDHEAD_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ACCOUNTANT_ROLE, FUNDHEAD_ROLE);
        _setRoleAdmin(BOARDMASTER_ROLE, FUNDHEAD_ROLE);

        tamagochiToken = TamagochiToken(tokenContractAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner is permitted!");
        _;
    }

    // ownership is checked in token contract also, but in order to fail early (gas!) we check it already in this contract...
    modifier isOwnerOf(uint token) {
        require(tx.origin == tamagochiToken.ownerOf(token), "Caller is not the owner of the token");
        _;
    }

    modifier isFeePaid(uint price) {
        require(price > 0, "price has not yet been set");
        require(msg.value >= price, "not enough ether provided");
        _;
    }

    function initTokenContract(address contractAddress) external onlyRole(ADMIN_ROLE) {
        tamagochiToken = TamagochiToken(contractAddress);
    } 

    function setFundraisingHead(address head) public onlyRole(ADMIN_ROLE) {
        fundraisingHead = head;
        grantRole(FUNDHEAD_ROLE, head);
    }

    function addAccountant(address account) external onlyRole(FUNDHEAD_ROLE) {
        grantRole(ACCOUNTANT_ROLE, account);
    }

    function addBoardMaster(address account) external onlyRole(FUNDHEAD_ROLE) {
        grantRole(BOARDMASTER_ROLE, account);
    }

    function removeAccountant(address account) external onlyRole(FUNDHEAD_ROLE) {
        revokeRole(ACCOUNTANT_ROLE, account);
    }

    function removeBoardMaster(address account) external onlyRole(FUNDHEAD_ROLE) {
        revokeRole(BOARDMASTER_ROLE, account);
    }

    function renounceAsAccountant() external onlyRole(ACCOUNTANT_ROLE) {
        renounceRole(ACCOUNTANT_ROLE, msg.sender);
    }

    function renounceAsBoardMaster() external onlyRole(BOARDMASTER_ROLE) {
        renounceRole(BOARDMASTER_ROLE, msg.sender);
    }
    
    function setTokenPrice(uint price) external onlyRole(ACCOUNTANT_ROLE) {
        tokenPrice = price;
    }

    function setResetPrice(uint price) external onlyRole(ACCOUNTANT_ROLE) {
        resetPrice = price;
    }

    function setItemPrice(uint index, uint newPrice) external onlyRole(ACCOUNTANT_ROLE) {
        items[index].price = newPrice;
    }

    function publishItem(string calldata name, uint price, uint24 fed, uint24 care, uint24 entertainment, uint24 education) external onlyRole(BOARDMASTER_ROLE) {
        Item memory item = Item(name, price, fed, care, entertainment, education);
        items.push(item);
    }

    function removeItem(uint index) external onlyRole(BOARDMASTER_ROLE) {
        // SMELL leaves a gap in the array!!!!
        delete items[index];
    }

    function customizeWellFedOptimum(uint24 optimum) external onlyRole(BOARDMASTER_ROLE) {
        tamagochiToken.setWellFedOptimum(optimum);
    }

    function customizeWellCareOptimum(uint24 optimum) external onlyRole(BOARDMASTER_ROLE) {
        tamagochiToken.setWellCareOptimum(optimum);
    }

    function customizeWellEntertainedOptimum(uint24 optimum) external onlyRole(BOARDMASTER_ROLE) {
        tamagochiToken.setWellEntertainedOptimum(optimum);
    }

    function customizeWellEducatedOptimum(uint24 optimum) external onlyRole(BOARDMASTER_ROLE) {
        tamagochiToken.setWellEducatedOptimum(optimum);
    }

    function buyItem(uint index, uint token) external payable isFeePaid(items[index].price) isOwnerOf(token) {
        Item memory item = items[index];
        tamagochiToken.applyItem(token, item.food, item.care, item.entertainment, item.education);
    }

    // TODO buy token and money is stores in internal account
    function buyToken(string calldata name) external payable isFeePaid(tokenPrice) {
        uint tokenId = tamagochiToken.mint();
        tamagochiToken.setTamagochiData(tokenId, name, address(this));
        tamagochiToken.resetAttributes(tokenId);
    }

    function resetTamagochi(uint token) external payable isFeePaid(resetPrice) {
        tamagochiToken.resetAttributes(token);
    }

    function payout() external onlyRole(FUNDHEAD_ROLE) {
        payable(fundraisingHead).transfer(address(this).balance);
    }

    function deactivate() external onlyRole(ADMIN_ROLE) {
        // DESIGN DECISION: who gets the fund upon deactivation (community or board owner?)
        selfdestruct(payable(fundraisingHead));
    }
}