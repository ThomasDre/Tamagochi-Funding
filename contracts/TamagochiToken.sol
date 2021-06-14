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
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Tamagochi.sol";

contract TamagochiToken is ERC721Pausable, AccessControl {

    address public owner;

    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 private constant FUNDRAISING_BOARD = keccak256("FUNDRAISING_BOARD");
    
    /*
    timestamp + WELL_X_OPTIMUM marks the highest possible saturation for an attribute
    as time passes the saturation shrinks (0 is minimum)

    the overall happiness is calculated by a formula
    <tbd>rewards high saturations disproportionally</tbd>
    */
    uint24 public constant WELL_FED_OPTIMUM_DEFAULT = 86400;            // 24h
    uint24 public constant WELL_CARE_OPTIMUM_DEFAULT = 259200;          // 3days
    uint24 public constant WELL_ENTERTAINED_OPTIMUM_DEFAULT = 604800;   // 1 week
    uint24 public constant WELL_EDUCATED_OPTIMUM_DEFAULT = 1209600;     // 2 weeks
    uint24 public constant COOLDOWN_DEFAULT = 3600;                     // 1h             
           

    mapping(address => bool) private customSettings;
    mapping(address => uint24) private customWellFedOptimum;
    mapping(address => uint24) private customWellCareOptimum;
    mapping(address => uint24) private customWellEntertainedOptimum;
    mapping(address => uint24) private customWellEducatedOptimum;
    mapping(address => uint24) private customCooldown;

    // SMELL: storing the data off-chain might be preferable
    mapping(uint => TamagochiData) private data;

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

    modifier cooldownOver(uint token) {
        uint32 currentTime = uint32(block.timestamp);
        require(data[token].cooldownEnd < currentTime, "Level up not allowed, wait for end of cooldown period");
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

    function getData(uint token) external view returns(TamagochiData memory) {
        return data[token];
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

    function getCooldown(address account) public view returns(uint24) {
        if (customCooldown[account] > 0) {
            return customCooldown[account];
        } else {
            return COOLDOWN_DEFAULT;
        }
    }

    // TODO (SMELL?!?) we have these methods here and then we also have a method calling for each of these in Fundraising...neccessaryy?
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

    function setCooldown(uint24 cooldown) public onlyRole(FUNDRAISING_BOARD) {
        customCooldown[msg.sender] = cooldown;
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
        bool isUnsatisfied = checkTamagochi(token);
        
        if (isUnsatisfied) {
            data[token].neglected++;
        }

        data[token].fed += food;
        data[token].care += careness;
        data[token].entertained += entertainment;
        data[token].educated += education;
        data[token].totalTreats += (food + careness + entertainment + education);
    }

    function levelUp(uint token) public onlyRole(FUNDRAISING_BOARD) isOwnerOf(token) cooldownOver(token) {
        (uint32 fedMin, uint32 careMin, uint32 entertainedMin, uint32 educatedMin) = calculateLevelUpMin();
        if (data[token].fed > fedMin) {
            data[token].size++;
        }
        if (data[token].care > careMin) {
            data[token].bond++;
        }
        if (data[token].entertained > entertainedMin) {
            data[token].happyness++;
        }
        if (data[token].educated > educatedMin) {
            data[token].nerdyness++;
        }

        data[token].cooldownEnd = uint32(block.timestamp) + getCooldown(msg.sender);
    }

    function resetAttributes(uint token) public onlyRole(FUNDRAISING_BOARD) isOwnerOf(token)  {
        // TODO evaluate whether this actually saves gas!!!
        uint32 currentTime = uint32(block.timestamp);
        data[token].fed = currentTime + WELL_FED_OPTIMUM_DEFAULT;
        data[token].care = currentTime + WELL_CARE_OPTIMUM_DEFAULT;
        data[token].entertained = currentTime + WELL_ENTERTAINED_OPTIMUM_DEFAULT;
        data[token].educated = currentTime + WELL_EDUCATED_OPTIMUM_DEFAULT;
        data[token].neglected = 0;
    } 

    function mint() public onlyRole(FUNDRAISING_BOARD) returns (uint) {
        uint tokenId = counter++;
        
        _safeMint(tx.origin, tokenId);

        uint32 time = uint32(block.timestamp);
        data[tokenId] = TamagochiData(
            // org and initial basic attributes
            msg.sender, 
            time + getWellFedOptimum(msg.sender), time + getWellCareOptimum(msg.sender), 
            time + getWellEntertainedOptimum(msg.sender), time + getWellEducatedOptimum(msg.sender),
            
            // cooldown, total_supply, neglected
            time + COOLDOWN_DEFAULT, 0, 0, 

            // start levels (associated attributes / dependant from basic attributes)
            1, 1, 1, 1
            );
        
        return tokenId;
    }

    function payout() external isOwner {
        payable(owner).transfer(address(this).balance);
    }

    function deactivate() external isOwner {
        _pause();
    }

    function activate() external isOwner {
        _unpause();
    }

    // only set customSettings if not already set (saves ~700 gas)
    function activateCustomSettings() private {
        if (customSettings[msg.sender] == false) {
            customSettings[msg.sender] = true;
        }
    }

    function checkTamagochi(uint token) private view returns(bool) {
        uint32 currentTime = uint32(block.timestamp);
        return data[token].fed < currentTime || data[token].care < currentTime || data[token].entertained < currentTime || data[token].educated < currentTime;
    }

    function calculateLevelUpMin() private view returns(uint32, uint32, uint32, uint32) {
        uint32 currentTime = uint32(block.timestamp);
        uint32 fedMin = currentTime + ((getWellFedOptimum(msg.sender) / 4) * 3);
        uint32 careMin = currentTime + ((getWellCareOptimum(msg.sender) / 4) * 3);
        uint32 entertainedMin = currentTime + ((getWellEntertainedOptimum(msg.sender) / 4) * 3);
        uint32 educatedMin = currentTime + ((getWellEducatedOptimum(msg.sender) / 4) * 3);
        return (fedMin, careMin, entertainedMin, educatedMin);
    }

    function calculatePerformance() private pure returns(uint32) {
        // something extremely important needs to be returned
        return 42;
    }
}