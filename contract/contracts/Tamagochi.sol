// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct TamagochiData {
        // the organisation minted the token
        address organisation;

        /*
        basic attributes that need to be taken care of
        
        can be improved by events/actions:
        e.g. wellFed = wellFed + action.wellFed
        
        saturation (shrinks over time) of an attribute is measured by:
        quality = attribute - timestamp
        */
        uint32 fed;
        uint32 care;
        uint32 entertained;
        uint32 educated;

        uint32 cooldownEnd;     // time when tamagochi can request the next level up

        /*
        general attributes (based on saturation of basic attributes)
        */
        uint32 totalTreats;     // total value of received treats
        uint24 neglected;       // times the basic needs of the token were not satisfied
        
        /*
        characteristics associated to basic attributes (the more often an attribute is satisfied the better for the associated characteristic)
        */
        uint8 size;             // affected by fed 
        uint8 bond;             // affected by care
        uint8 happyness;        // affected by entertained
        uint8 nerdyness;        // affected by educated
    }