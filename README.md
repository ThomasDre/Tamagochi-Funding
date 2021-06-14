My Final Project
================

### Deadline: Mon, 14 June 2021, 23:55

Topic
---------
Choose a topic to your liking for your own project.
If you have no preference for any topic, you may build on the TU beer bar by either replacing parts and/or extending the existing project. 
This could be a pub quiz, an extended beer supply, or an extended voting board for example.

Grading
---------
We consider the following aspects:
- Documentation: Provide the documentation of your project by completing the project details in the README.md on git. Add further files as necessary.
- Complexity: The project should be non-trivial. Rather, it should make use of mappings, roles with RBAC, modifiers, Ether, and tokens when reasonable. Moreover, it should provide a simple web interface for interaction with the contract.
- Correctness: The project should use correct math (big numbers, overflow), include test cases and ensure that neither any ether nor any tokens are lost.
- Security: Try to avoid that the contract can be depleted by any method used in the challenges.
- Originality: We would like your projects to be distinguishable from reproductions, clones, forgeries, or derivative works. On a side note: we've already seen too many casinos.

We place less value on a fancy WebUI, as it is not part of the LVA.

Your project is complex enough if 40 hours of effort are understandable for us.


Submission and Presentation
---------
Submit your project on your `master` branch on git.sc.logic.at and present it in the online review session on Thu, 17.06.2021. 
Reserve a time slot via Tuwel.

---------------------------

Project details
===============

Addresses
---------
TODO - Write here on which addresses you have deployed the contracts on the LVAChain:

Description
-----------
Nomen est omen, and therefore the main usecase of this project is as the contract "Fundraising.sol" states :)

Once the project is launced, organisation that are interested can request to participate in this project. Participating means the organisations get the opportunity to have their own "fundraising board".

The request to participate actually happens "off-chain" (per contact and then simply by inviting the organisation via their account), though right now there is also the possibility to request a participation "on-chain" (which does nothing else than to fire an event to inform the owner...)

Once an organisation is added to the project by the owner, a new fundraising-board is created and the "chairman" of the organisation is added to the fundraising-board as the fundraising-head (== ADMIN). The fundraising-head can adminstrate the fundraising board of his organisation by inviting other people to take over the roles of an
    - Accountant
    - BoardMaster
We will describe the duties of these roles once we have summarized the main purpose of this fundraising-board


How does the fundraising work?
Each fundraising-board is authorized to interact with a ERC-721 Token "TamagochiToken".
As an authorized-user a fundraising-board can mint TamagochiToken on behalf of a customer and sell the newly minted token to the customer. (NOTE: customer == donater of the organisation)
As always tamagochis need to be taken care of, and therefore they need supply-items to keep them happy and satisfied (more on details later). A fundraising-board does also provide a unique shop with items that can be bought by customers for their tamagochis in order to supply them with resources.
If the basic needs of a tamagochi are satisfied then a customer can level-up their tamagochis

To keep it simple: Organisations collect funds by organising a tamagochi-game. The settings can be customized and if customers play tamagochi with a tamagochi that originated from an organisation's fundraising-board, then this organisation earns some wei.

PS. Just like in an EA game, absolutely anything that a customer can do with one og his tamagochis costs money.... but at least the organisation gets all the payments, and not me, so that should be enough for some good karma I guess (hooray!)

What are the duties of the other roles?
The "fundraising-head" can add other people to specific roles and can request a payout of all the collected funds for his organisation.
The "accountant" can set the prices for
    - token (though if a customer pays more than the price, than this is treated as an additional donation and will not be refunded)
    - resetPrice (tamagochis that had a hard life, can be reset. Thereby the lose their horrible memories about their unworthy owners and might be happy again)
    - item prices (the price of each published item can be adjusted)
The "boardMaster" is the actual hero and is responsible for configuring the settings for the tamagochi of the board:
    - customized tamagochi's well-fed, well-cared etc parameters (that is how much supply is needed to satisfy a tamagochi of this organisation)
    - puplish new items that can be bought by customers
      - items have attributes (food, care, entertainment, education) that are unique per item and if a tamagochi is supplied with an item, it will benefit from the item's attributes
    - customize cooldown period (how often can a customer request a level-up for one of their tamagochis)

Tamagochi Details:
Each Tamagochi has 4 basic needs:
    - fed
    - cared
    - entertained
    - educated

The satisfaction of a basic need is given as:
    satisfaction = tamagochi.fed - currentBlockTime (for basic need fed)

The maximum satisfaction of a basic need is given per DEFAULT or a CUSTOM value can be used by each organisation

Supplying an item to a tamagochi results in an update of all the tamahochis basic needs attributes as follows:
    tamagochi.fed = tamagochi.fed + item.food

E.g.    CurrentBlockTime = 10000 and wellFedOptimum = 100; new tamagochi minted at exactly that time:
        New tamagochi is created and all its attributes are set to fully satisfied.
        That is at timePassed=0:    tamagochi.fed = 100100 and satisfied = 100 for fed which is also the optimum for this basic need
        Later timePassed=90:        tamagochi.fed = 100100 and satisfied = 10  for fed (item supply is needed before tamagochi gets very sad)
        Item bought(30,40,50,10)    tamagochi.fed = 100130 and satisfied = 40  for fed
    

Each tamagochi has 3 general attributes:
    - totalSupply       ... the sum of all the cumulative values of all the supplied item's attributes (food,care,...) 
    - neglected         ... the number of times a tamagochi reached satisfaction=0 for a basic need
    - cooldownEnd       ... the earlies time a tamagochi can request the next level-up

A tamagochi can level-up if  one or several basic needs are satisfied to a given extend (75 %). Therefore they need to be supplied with items regularly.
Supplying a tamagochi always increases the tamagochi's basic-need attributes, BUT if a basic need was already violated at the time of the item-supply then the 'neglected' count will be increased.

PS. Not supplying a tamagochi for a very long time with goods only triggers one increase of the neglected count, but the satisfaction obviously can become a big negative number (e.g. currentBlockTime = 1000000 and tamagochi.fed = 100130, then satisfactio = -899830)
It might be better to simply reset the token than to supply tons of items (which would also increase the neglected count for anytime the saturation is still negative)


Each tamagochi has 4 level attributes which are associated to the basic needs:
    - size      (=> fed)
    - bond      (=> care)
    - happyness (=> entertained)
    - nerdyness (=> educated)

Requesting a level-up when at least one basic-need is above saturation threshold, results in a level-up of the associated level-attribute


Implementation
--------------
General infos:
Board is used by the owner this project in order to add new organisations. As said, usually an organisation will request participation offline and then they will be directly invited via their account's address.
It is also possible that an interested party can request participation on-chain. This will fire an event, and they will be visible on the adminsÄ dashboard.

Adding a organisation has the following effects:
    - Board creates a new Fundraising contract for each participant
    - Board authorized the new Fundraising contracts as a authorized user in the TamagochiToken contract, such that this fundraising board can mint new tokens and interact with them on behalf of its custoners (doantors)
!!!!!!!!!!!!!!!!
NOTE: very questionable design decision to launch a new contract for each organisation (the deployment costs are no joke and have to be paid by some poor bastard, which would be me....)
!!!!!!!!!!!!!!!!

TamagochiTokens will only interact with authorized Fundraising contracts (except that the owner of the TamagochToken contract can also pause/deactivate it)


Specific infos:
TamagochiToken are ERC721 tokens
    - OpenZeppelin Standard implementation is used
    - implement ERC721Pausable as a security fallback option, if something goes wrong and the process needs to be deactivated (at least for a while)

OpenZeppelins AccessControl is used to implement a role-based system


Considerations and potentially flaws:
    - tamagochi data are stored on-chain (quite big struct): it might be preferable to store data off-chian (IPFS) and link tamagochi and data via the tokenID
    - tamagochi's attributes (stored in struct) are time-related. As blocktime is a uint256, I decided to use only uint32 for all the attributes (which is more than enough until the year 2104)
      - however: not evaluated whether the necessary casting might have negative effects on gas-costs (which potentially could dominate the positive effects of smaller datatypes in the first place)
    - architecture smell: Fundraising has to do a lot of 1-line calls to TamagochiToken (refactoring and putting some of the responsibilities out of the TamagochiToken contract could reduce the required number of transactions between both contracts)
    - Testsuite is not complete


Effort breakdown
------------------
Unfortunately flawed initial estimation of required work:
~ 10 h (search for ideas and some pre-work on another idea that was aborted)
~ 30h (working on contracts and testssuite)
~ 10-15h (rework, bug fixes, some more critical problems observed and some changes to the initial plan)
~ 5h (adapting the frontend template to get a minimum UI)

Difficulties
------------
The biggest problem was actually to find an idea, that is "doable" and makes sense.
Except for that no particular problems besides some minor problems that occured sometimes (delegatecall was not wokring as expected but this is not needed in this version anyhow, etc)
Time was an issue, especially for the UI part, as the progress was not as fast as expected


Further Notes:
--------------
Some parts of the project have not yet been developed (partly planned, partly due to time limitations)
That includes:
    - an evaluation function that calculates character/behaviour traits for a tamagochi token
      - i.e. tamagochis with a high size level become very clumsy, or happy tamagochis behave very activ and dance or whatever
      - all of these chacacteristics would be represented by some further attributes
      - and the attributes would (as stated) be calcualted based on the
        - given level of a tamagochi
        - the current level of saturation of its basic needs
        - some historic data (e.g. num of neglected-count has negative effects, total-number of treats has positive effect)
    - party-board where
      - operators can announce a party (with a specific topic)
      - tamagochi owners can register their tokens to the party
      - registering costs some money (goes into pot)
      - based on the topic of the party and the behaviour/appearance of the tamagochis (see evaluation function above) the visitors can vote which tamagochi was the best fit for the party
      - voting costs some money (goes into pot)
      - 1st, 2nd, 3rd tamagochis and the organisation of the tokens are rewarded with the money from the pot
    - additional item-shop (not fundraising-board specific but one shop for all tamagochis, adminstratered by me or some authorized user)
      - accesoires etc to buy which also have a positive/negative effect on the performance of the tamagochis at a party



Proposal for future changes
---------------------------


---------------------------

HOWTO
=====
Run `npm install` to install all dependencies.

This repository contains an initialized Truffle project.

Recommended web3.js version: v1.3.4

Truffle
-------
Implement your contracts in the `contracts/` folder.

Implement your test cases in the `tests/` folder.
You can run them with `npm run truffle test`.

With `npm run truffle develop` you can start a local truffle development chain.

You can deploy the project to the LVAChain via `npm run truffle deploy -- --network=prod` (requires running `geth` client).
If you use roles, please make us - the person at `addresses.getPublic(4)` - an owner/admin of the contract.

Web interface
-------------
You are free to implement your web interface via static JavaScript files (similar to the BeerBar),
or to use any suitable framework (like [React](https://reactjs.org/), [Angular](https://angular.io/), [Vue](https://vuejs.org/), or [Drizzle-React](https://github.com/trufflesuite/drizzle-react)).

If you use only static content, put your files into the `public/` folder.   
You can run a local webserver with `npm run serve`.  

If you use another framework, you will need to adjust the `build` command in `package.json`. Follow the documentation of your framework for doing so.
You can e.g. use `webpack` to compile your files, and copy the output into the `public/` folder.

The content of your `public/` folder will also be available via the URL <https://final.pages.sc.logic.at/e01305257>.

