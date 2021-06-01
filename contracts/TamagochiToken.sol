// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TamagochiToken is ERC721, Ownable {

    /*
    NFT collectible, that can represents a tamagochi that fight for a particular beneficial project

    Owners need to support the tamagochi in achiving its goals
    Thereby the owners will further donate to the associated project!
     */

     constructor() ERC721("Tamagochin NFT", "TAT") {}

     
  
}