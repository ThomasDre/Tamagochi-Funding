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

    mapping(address => bool) private customSettings;
    mapping(address => uint24) private customWellFedOptimum;
    mapping(address => uint24) private customWellCareOptimum;
    mapping(address => uint24) private customWellEntertainedOptimum;
    mapping(address => uint24) private customWellEducatedOptimum;

    // SMELL: storing the data off-chain might be preferable
    mapping(uint => TamagochiData) public data;

    uint private counter = 0;

    // TODO mappings for items (headwear, shorts, shirts, jackets, neat-stuff)


    /*
    NFT collectible, that can represents a tamagochi that fight for a particular beneficial project

    Owners need to support the tamagochi in achiving its goals
    Thereby the owners will further donate to the associated project!
     */

    constructor(address board) ERC721("Tamagochin NFT", "TAT") {
        owner = msg.sender;
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, board);
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

    function isCustomSetting(address account) public view returns(bool) {
        return customSettings[account];
    }

    function getWellFedOptimum(address account) public view returns(uint24) {
        if (customWellFedOptimum[account] > 0) {
            return customWellFedOptimum[account];
        } else {
            return WELL_FED_OPTIMUM_DEFAULT;
        }
    }

    function getWellCareOptimum(address account) public view returns(uint24) {
        if (customWellCareOptimum[account] > 0) {
            return customWellCareOptimum[account];
        } else {
            return WELL_CARE_OPTIMUM_DEFAULT;
        }
    }

    function getWellEntertainedOptimum(address account) public view returns(uint24) {
        if (customWellEntertainedOptimum[account] > 0) {
            return customWellEntertainedOptimum[account];
        } else {
            return WELL_ENTERTAINED_OPTIMUM_DEFAULT;
        }
    }

    function getWellEducatedOptimum(address account) public view returns(uint24) {
        if (customWellEducatedOptimum[account] > 0) {
            return customWellEducatedOptimum[account];
        } else {
            return WELL_EDUCATED_OPTIMUM_DEFAULT;
        }
    }

    function setWellFedOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        customWellFedOptimum[msg.sender] = optimum;
        activateCustomSettings();
    }

    function setWellCareOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        customWellCareOptimum[msg.sender] = optimum;
        activateCustomSettings();
    }

    function setWellEntertainedOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        customWellEntertainedOptimum[msg.sender] = optimum;
        activateCustomSettings();
    }

    function setWellEducatedOptimum(uint24 optimum) public onlyRole(FUNDRAISING_BOARD) {
        customWellEducatedOptimum[msg.sender] = optimum;
        activateCustomSettings();
    }

     function resetOptimums() public onlyRole(FUNDRAISING_BOARD) {
        delete customSettings[msg.sender];
        delete customWellFedOptimum[msg.sender];
        delete customWellCareOptimum[msg.sender];
        delete customWellEntertainedOptimum[msg.sender];
        delete customWellEducatedOptimum[msg.sender];
    }

    function applyItem(uint token, uint24 food, uint24 careness, uint24 entertainment, uint24 education) public onlyRole(FUNDRAISING_BOARD) isOwnerOf(token) {
        data[token].fed += food;
        data[token].care += careness;
        data[token].entertained += entertainment;
        data[token].educated += education;
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
        uint tokenId = counter++;
        
        _safeMint(tx.origin, tokenId);

        uint32 time = uint32(block.timestamp);
        data[tokenId] = TamagochiData(msg.sender, time, time, time, time);
        
        return tokenId;
    }

    function payout() external isOwner {
        payable(owner).transfer(address(this).balance);
    }

    function deactivate() external isOwner {
        selfdestruct(payable(owner));
    }

    // only set customSettings if not already set (saves ~700 gas)
    function activateCustomSettings() private {
        if (customSettings[msg.sender] == false) {
            customSettings[msg.sender] = true;
        }
    }
}