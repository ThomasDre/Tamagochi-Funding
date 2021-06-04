// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
TODOS:
-) apply a method that calculates a mood/attitude/behaviour value
-) satisfying the needs regularly has positive effects
-) current satisfaction of tamagochi is also important (but just a necessity, does not guarantee good results)
-) additional gimmicks add a positive random value

-) tamagochis can participate in events (X-taste parties)
-) dependant on their appearance and behaviour the people vote whether the tamagochi is a good fit for the party

-) party will be implemented either in Board.sol or in a unique contract (for all token owners)
*/

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TamagochiToken is ERC721, AccessControl {

    struct TamagochiData {
        // the organisation minted the token
        address organisation;
        // individual name
        string name;
        /*
        attributes
        
        can be improved by events/actions:
        e.g. wellFed = wellFed + action.wellFed
        
        saturation (shrinks over time) of an attribute is measured by:
        quality = attribute - timestamp
        */
        uint32 fed;
        uint32 care;
        uint32 entertained;
        uint32 educated;
    }

    address public owner;

    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN");
    // TODO this role is not needed
    bytes32 private constant FUNDHEAD_ROLE = keccak256("FUNDRAISING_HEAD");
    bytes32 private constant FUNDRAISING_BOARD = keccak256("FUNDRAISING_BOARD");
    
    /*
    timestamp + WELL_X_OPTIMUM marks the highest possible saturation for an attribute
    as time passes the saturation shrinks (0 is minimum)

    the overall happiness is calculated by a formula
    <tbd>rewards high saturations disproportionally</tbd>
    */
    uint24 public constant WELL_FED_OPTIMUM_DEFAULT = 86400;          // 24h
    uint24 public constant WELL_CARE_OPTIMUM_DEFAULT = 259200;        // 3days
    uint24 public constant WELL_ENTERTAINED_OPTIMUM_DEFAULT = 604800; // 1 week
    uint24 public constant WELL_EDUCATED_OPTIMUM_DEFAULT = 1209600;   // 2 weeks

    mapping(address => bool) customSettings;
    mapping(address => uint24) wellFedOptimumCustom;
    mapping(address => uint24) wellCareOptimumCustom;
    mapping(address => uint24) wellEntertainedOptimumCustom;
    mapping(address => uint24) wellEducatedOptimumCustom;

    // SMELL: storing the data off-chain might be preferable
    mapping(uint => TamagochiData) public data;

    // TODO mappings for items (headwear, shorts, shirts, jackets, neat-stuff)


    /*
    NFT collectible, that can represents a tamagochi that fight for a particular beneficial project

    Owners need to support the tamagochi in achiving its goals
    Thereby the owners will further donate to the associated project!
     */

    constructor(address mainBoard) ERC721("Tamagochin NFT", "TAT") {
        owner = msg.sender;
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, mainBoard);
        _setRoleAdmin(FUNDHEAD_ROLE, ADMIN_ROLE);
        _setRoleAdmin(FUNDRAISING_BOARD, ADMIN_ROLE);
    }
    
    modifier isOwner() {
        require(tx.origin == owner, "Only owner is permitted to set authorizations");
        _;
    }

    modifier isOwnerOf(uint token) {
        require(tx.origin == ownerOf(token), "Sender is not the owner of the tamagochi");
        _;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return interfaceId == type(IERC721).interfaceId
            || interfaceId == type(IERC721Metadata).interfaceId
            || interfaceId == type(AccessControl).interfaceId;
    }

    function authorizeBoard(address board) public onlyRole(ADMIN_ROLE) {
        grantRole(FUNDRAISING_BOARD, board);
    }

    function activateCustomSettings() private {
        if (customSettings[msg.sender] == false) {
            customSettings[msg.sender] = true;
        }
    }

    function setWellFedOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        customSettings[msg.sender] = true;
        wellFedOptimumCustom[msg.sender] = optimum;
    }

    function setWellCareOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        wellCareOptimumCustom[msg.sender] = optimum;
        activateCustomSettings();
    }

    function setWellEntertainedOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        wellEntertainedOptimumCustom[msg.sender] = optimum;
    }

    function setWellEducatedOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        wellEducatedOptimumCustom[msg.sender] = optimum;
    }

    function setTamagochiData(uint token, string calldata name, address organisation) public onlyRole(FUNDRAISING_BOARD) {
        data[token].name = name;
        data[token].organisation = organisation;
    }

    function applyItem(uint token, uint24 food, uint24 careness, uint24 entertainment, uint24 education) public onlyRole(FUNDRAISING_BOARD) isOwnerOf(token) {
        data[token].fed += food;
        data[token].care += careness;
        data[token].entertained += entertainment;
        data[token].educated += education;
    }

    function resetOptimums() public onlyRole(FUNDRAISING_BOARD) {
        delete customSettings[msg.sender];
        delete wellFedOptimumCustom[msg.sender];
        delete wellCareOptimumCustom[msg.sender];
        delete wellEntertainedOptimumCustom[msg.sender];
        delete wellEducatedOptimumCustom[msg.sender];
    }

    function resetAttributes(uint token) public onlyRole(FUNDRAISING_BOARD) isOwnerOf(token)  {
        // TODO evaluate whether this actually saves gas!!!
        uint32 currentTime = uint32(block.timestamp);
        data[token].fed = currentTime + WELL_FED_OPTIMUM_DEFAULT;
        data[token].care = currentTime + WELL_CARE_OPTIMUM_DEFAULT;
        data[token].entertained = currentTime + WELL_ENTERTAINED_OPTIMUM_DEFAULT;
        data[token].educated = currentTime + WELL_EDUCATED_OPTIMUM_DEFAULT;
    } 

    function mint() public onlyRole(FUNDRAISING_BOARD) returns (uint) {
        uint tokenId = uint(keccak256(abi.encodePacked(block.number)));
        _safeMint(tx.origin, tokenId);
        return tokenId;
    }

    function payout() external isOwner {
        payable(owner).transfer(address(this).balance);
    }

    function deactivate() external isOwner {
        selfdestruct(payable(owner));
    }
}