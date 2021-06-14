// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Fundraising.sol";

contract Board {

    struct Organisation {
        string name;
        Fundraising fundraising;
    }

    // basic infos
    address public owner;

    // participating organisations
    mapping(address => Organisation) public organisationBoards;
    mapping(address => bool) public registered;
    address[] public organisations;

    TamagochiToken public tamagochiToken;

    event OrganisationRequest(address account, string name, string url);
    event OrganisationAdded(string name, address account);
    event OrganisationRemoved(string name, address account);

    constructor() {
        owner = msg.sender;
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner is permitted!");
        _;
    }

    modifier isRegistered(address account) {
        require(registered[account] == true, "Organisation is not registered!");
        _;
    }

    modifier isNotRegistered(address account) {
        require(registered[account] == false, "Organisation is already registered!");
        _;
    }

    modifier isInit() {
        require(address(tamagochiToken) != address(0), "Token Contract has not yet been initialized");
        _;
    }

    function setTokenContractAddress(address contractAddress) external onlyOwner {
        tamagochiToken = TamagochiToken(contractAddress);
    }

    // only owner decides who is allowed to participate on this platform
    function addOrganisation(address account, string calldata name) external onlyOwner isNotRegistered(account) isInit {
        Fundraising fundraising = new Fundraising(address(tamagochiToken));
        fundraising.setFundraisingHead(account);
        tamagochiToken.authorizeBoard(address(fundraising));

        Organisation memory organisation = Organisation(name, fundraising);

        organisationBoards[account] = organisation;
        registered[account] = true;
        organisations.push(account);

        emit OrganisationAdded(name, account);
    }

    // manually remove org from board and deactivate associated funding contract
    function removeOrganisation(address account) external onlyOwner isRegistered(account) {
        Fundraising fundraising = Fundraising(organisationBoards[account].fundraising);
        fundraising.deactivate();

        emit OrganisationRemoved(organisationBoards[account].name, account);
        delete organisationBoards[account];
        delete registered[account];

        for (uint i = 0; i < organisations.length; i++) {
            if (organisations[i] == account) {
                delete organisations[i];
            }
        }
    }

    // returns the fundraising contract that is associated to a given organisation
    function getFundraisingContract(address account) public view isRegistered(account) returns (Fundraising) {
        return organisationBoards[account].fundraising;
    }

    // organisations can send an request for participation on this platform
    function request(string memory name, string memory url) external {
        emit OrganisationRequest(msg.sender, name, url);
    }

    /*  
    TODO possible not needed anymore
    function authorizeBoard(address account) private {
        string memory signature = "authorizeBoard(address)";
        bytes memory input = abi.encodeWithSignature(signature, account);
        (bool status, ) = address(tamagochiToken).delegatecall(input);
        if (status != true) {
            revert();
        }
    }
    */

    // any ether that has been deposited in this contract can be retrieved
    function payout() external onlyOwner {
        // DESIGN DECISION: who gets donation that were deposited in this contract (owner or share it with organisations?)
        payable(owner).transfer(address(this).balance);
    }

    function deactivate() external onlyOwner {
        selfdestruct(payable(owner));
    }
}