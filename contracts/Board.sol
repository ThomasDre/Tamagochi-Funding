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

    event OrganisationRequest(string name, string url);
    event OrganisationAdded(string name, address account);
    event OrganisationRemoved(string name, address account);

    constructor() {
        owner = msg.sender;
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner is permitted!");
        _;
    }

    modifier isRegistered(address _account) {
        require(registered[_account] == true, "Organisation is not registered!");
        _;
    }

    modifier isNotRegistered(address _account) {
        require(registered[_account] == false, "Organisation is already registered!");
        _;
    }

    // only owner decides who is allowed to participate on this platform
    function addOrganisation(address _account, string calldata _name) external onlyOwner isNotRegistered(_account) {
        Fundraising fundraising = new Fundraising();
        fundraising.setFundraisingHead(_account);

        Organisation memory organisation = Organisation(_name, fundraising);

        organisationBoards[_account] = organisation;
        registered[_account] = true;
        organisations.push(_account);

        emit OrganisationAdded(_name, _account);
    }

    // manually remove org from board and deactivate associated funding contract
    function removeOrganisation(address _account) external onlyOwner isRegistered(_account) {
        Fundraising fundraising = Fundraising(organisationBoards[_account].fundraising);
        fundraising.deactivate();

        delete organisationBoards[_account];
        delete registered[_account];

        for (uint i = 0; i < organisations.length; i++) {
            if (organisations[i] == _account) {
                delete organisations[i];
            }
        }
    }

    // returns the fundraising contract that is associated to a given organisation
    function getFundraisingContract(address _account) public view isRegistered(_account) returns (Fundraising) {
        return Fundraising(organisationBoards[_account].fundraising);
    }

    // organisations can send an request for participation on this platform
    function request(string memory _name, string memory _url) external {
        emit OrganisationRequest(_name, _url);
    }

    // any ether that has been deposited in this contract can be retrieved
    function payout() external onlyOwner {
        // DESIGN DECISION: who gets donation that were deposited in this contract (owner or share it with organisations?)
        payable(owner).transfer(address(this).balance);
    }

    // FEATURE
    // deslfestruct option...
}