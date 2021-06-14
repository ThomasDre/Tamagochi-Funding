const truffleAssert = require('truffle-assertions');

const TamagochiToken = artifacts.require("TamagochiToken");


function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
  

contract("TamagochiToken test", async accounts => {

    let owner = accounts[0];
    let admin = accounts[1];
    let board = accounts[2];
    let otherBoard = accounts[3];
    let customer = accounts[4]; 

    const ADMIN_ROLE = web3.utils.keccak256("ADMIN");
    const FUNDRAISING_BOARD = web3.utils.keccak256("FUNDRAISING_BOARD"); 

    const WELL_FED_OPTIMUM_DEFAULT = 86400;          // 24h
    const WELL_CARE_OPTIMUM_DEFAULT = 259200;        // 3days
    const WELL_ENTERTAINED_OPTIMUM_DEFAULT = 604800; // 1 week
    const WELL_EDUCATED_OPTIMUM_DEFAULT = 1209600;   // 2 weeks

    const CUSTOM_FED_OPTIMUM = 10000;
    const CUSTOM_CARE_OPTIMUM = 20000;
    const CUSTOM_ENTERTAINED_OPTIMUM = 30000;
    const CUSTOM_EDUCATED_OPTIMUM = 40000;

    let token;

    async function initAndDeploy() {
        token = await TamagochiToken.new(admin);
        //token.addAdmin(admin, {from: owner});
    }
    
    beforeEach("deploy and init", async () => {
        await initAndDeploy();
    });

    it("owner and mainBoard have admin roles", async () => {
        assert.equal(await token.hasRole(ADMIN_ROLE, owner), true);
        assert.equal(await token.hasRole(ADMIN_ROLE, admin), true);
    });

    it("authorized boards and other accounts dont have admin roles", async () => {
        await token.authorizeBoard(board, {from: admin});
        assert.equal(await token.hasRole(ADMIN_ROLE, board), false);
        assert.equal(await token.hasRole(ADMIN_ROLE, customer), false);
    })
    
    it("admin can authorize boards", async () => {
        await token.authorizeBoard(board, {from: admin});
        assert.equal(await token.hasRole(FUNDRAISING_BOARD, board), true);
    });

    it("ordinary user can not authorize boards", async () => {
        truffleAssert.reverts(token.authorizeBoard(board, {
            from: customer
        }));
        assert.equal(await token.hasRole(FUNDRAISING_BOARD, board), false);
    });


    it("authorized board can set unique settings for fed optimum", async () => {
        await token.authorizeBoard(board,{from: admin});
        assert.equal(await token.getWellFedOptimum(board), WELL_FED_OPTIMUM_DEFAULT);
        assert.equal(await token.isCustomSetting(board), false);
        await token.setWellFedOptimum(CUSTOM_FED_OPTIMUM, {from: board});
        assert.equal(CUSTOM_FED_OPTIMUM, await token.getWellFedOptimum(board));
        assert.equal(await token.isCustomSetting(board), true);
    });

    it("authorized board can set unique settings for care optimum", async () => {
        await token.authorizeBoard(board,{from: admin});
        assert.equal(await token.getWellCareOptimum(board), WELL_CARE_OPTIMUM_DEFAULT);
        assert.equal(await token.isCustomSetting(board), false);
        await token.setWellCareOptimum(CUSTOM_CARE_OPTIMUM, {from: board});
        assert.equal(CUSTOM_CARE_OPTIMUM, await token.getWellCareOptimum(board));
        assert.equal(await token.isCustomSetting(board), true);
    });

    it("authorized board can set unique settings for entertained optimum", async () => {
        await token.authorizeBoard(board,{from: admin});
        assert.equal(await token.getWellEntertainedOptimum(board), WELL_ENTERTAINED_OPTIMUM_DEFAULT);
        assert.equal(await token.isCustomSetting(board), false);
        await token.setWellEntertainedOptimum(CUSTOM_ENTERTAINED_OPTIMUM, {from: board});
        assert.equal(CUSTOM_ENTERTAINED_OPTIMUM, await token.getWellEntertainedOptimum(board));
        assert.equal(await token.isCustomSetting(board), true);
    });

    it("authorized board can set unique settings for educated optimum", async () => {
        await token.authorizeBoard(board,{from: admin});
        assert.equal(await token.getWellEducatedOptimum(board), WELL_EDUCATED_OPTIMUM_DEFAULT);
        assert.equal(await token.isCustomSetting(board), false);
        await token.setWellEducatedOptimum(CUSTOM_EDUCATED_OPTIMUM, {from: board});
        assert.equal(CUSTOM_EDUCATED_OPTIMUM, await token.getWellEducatedOptimum(board));
        assert.equal(await token.isCustomSetting(board), true);
    });

    it("non authorized account can not set unique settings", async () => {
        truffleAssert.reverts(token.setWellFedOptimum(CUSTOM_FED_OPTIMUM, {from: otherBoard}));
        truffleAssert.reverts(token.setWellCareOptimum(CUSTOM_CARE_OPTIMUM, {from: otherBoard}));
        truffleAssert.reverts(token.setWellEntertainedOptimum(CUSTOM_ENTERTAINED_OPTIMUM, {from: otherBoard}));
        truffleAssert.reverts(token.setWellEducatedOptimum(CUSTOM_EDUCATED_OPTIMUM, {from: otherBoard}));
        assert.equal(await token.isCustomSetting(otherBoard), false);
    });

    it("authorized board can reset its optimums", async () => {
        await token.authorizeBoard(board, {from: admin});
        assert.equal(await token.isCustomSetting(board), false);
        assert.equal(await token.getWellFedOptimum(board), WELL_FED_OPTIMUM_DEFAULT);

        await token.setWellFedOptimum(CUSTOM_FED_OPTIMUM, {from: board});
        assert.equal(await token.isCustomSetting(board), true);
        assert.equal(await token.getWellFedOptimum(board), CUSTOM_FED_OPTIMUM);

        await token.resetOptimums({from: board});
        assert.equal(await token.isCustomSetting(board), false);
        assert.equal(await token.getWellFedOptimum(board), WELL_FED_OPTIMUM_DEFAULT);
    });

    it("non authorized account can not reset its optimums", async () => {
        truffleAssert.reverts(token.resetOptimums({from: otherBoard}));
    });

    it("authorized boards can mint unique tokens", async () => {
        await token.authorizeBoard(board, {from: admin});
        await token.authorizeBoard(otherBoard, {from: admin});
        await token.mint({from: board});
        await token.mint({from: otherBoard});

        let token1 = 0;
        let token2 = 1;

        assert.equal(await(await token.getData(token1)).organisation, board, "organisation not set for token1");
        assert.equal(await(await token.getData(token2)).organisation, otherBoard, "organisation not set for token2");
        assert.equal(token1.toString() != token2.toString(), true, "token1 and token2 must be different");
    });

    it("non authorized accounts can not mint tokens", async () => {
        truffleAssert.reverts(token.mint({from: otherBoard}));
    });

    it("token owner can supply tokens with items", async () => {
        await token.authorizeBoard(board, {from: admin});
        // note board now is both the issuer of the mint-op but also the owner of the new token
        await token.mint({from: board});

        let tokenId = 0;

        let fed = web3.utils.toBN(await(await token.getData(tokenId)).fed);
        let care = web3.utils.toBN(await(await token.getData(tokenId)).care);
        let entertained = web3.utils.toBN(await(await token.getData(tokenId)).entertained);
        let educated = web3.utils.toBN(await(await token.getData(tokenId)).educated);

        // psuedo item values
        let fedPlus = new web3.utils.BN(10);
        let carePlus = new web3.utils.BN(20);
        let entertainedPlus = new web3.utils.BN(30);
        let educatedPlus = new web3.utils.BN(40);

        await token.applyItem(tokenId, fedPlus, carePlus, entertainedPlus, educatedPlus, {from: board});

        assert.equal(await(await token.getData(tokenId)).fed.toString(), fed.add(fedPlus).toString());
        assert.equal(await(await token.getData(tokenId)).care.toString(), care.add(carePlus).toString());
        assert.equal(await(await token.getData(tokenId)).entertained.toString(), entertained.add(entertainedPlus).toString());
        assert.equal(await(await token.getData(tokenId)).educated.toString(), educated.add(educatedPlus).toString());
    });

    it("foreign tokens can not be supplied with items", async () => {
        await token.authorizeBoard(board, {from: admin});
        let tokenId = new web3.utils.toBN(await token.mint.call({from: board}));
        truffleAssert.reverts(token.applyItem(tokenId, 10, 10, 10, 10, {from: otherBoard}));
    });

    
    it("token owner can reset his token's attributes", async () => {
        await token.authorizeBoard(board, {from: admin});
        // note board now is both the issuer of the mint-op but also the owner of the new token
        await token.mint({from: board});

        let tokenId = 0;

        let fed = web3.utils.toBN(await(await token.getData(tokenId)).fed);
        let care = web3.utils.toBN(await(await token.getData(tokenId)).care);
        let entertained = web3.utils.toBN(await(await token.getData(tokenId)).entertained);
        let educated = web3.utils.toBN(await(await token.getData(tokenId)).educated);

        let timeToWait = 1500;  // block for 1 1/2 seconds
        let timeWaited = 2;     // blocktime measured in secs, therefore blocktime will have already increased by 3
        let reloadFed = new web3.utils.BN(timeWaited + WELL_FED_OPTIMUM_DEFAULT);
        let reloadCare = new web3.utils.BN(timeWaited + WELL_CARE_OPTIMUM_DEFAULT);
        let reloadEntertained = new web3.utils.BN(timeWaited + WELL_ENTERTAINED_OPTIMUM_DEFAULT);
        let reloadEducated = new web3.utils.BN(timeWaited + WELL_EDUCATED_OPTIMUM_DEFAULT);

        sleep(timeToWait)
        
        await token.resetAttributes(tokenId, {from: board});
        assert.equal(await(await token.getData(tokenId)).fed.toString(), fed.add(reloadFed).toString());
        assert.equal(await(await token.getData(tokenId)).care.toString(), care.add(reloadCare).toString());
        assert.equal(await(await token.getData(tokenId)).entertained.toString(), entertained.add(reloadEntertained).toString());
        assert.equal(await(await token.getData(tokenId)).educated.toString(), educated.add(reloadEducated).toString());
    });

    it("foreign token can not be reset", async () => {
        await token.authorizeBoard(board, {from: admin});
        let tokenId = new web3.utils.toBN(await token.mint.call({from: board}));
        truffleAssert.reverts(token.resetAttributes(tokenId, {from: otherBoard}));
    });

    
    // NOTE simply tests that only owner can call it, whether the payout actually works is not tested...
    it("owner can request payout", async () => {
        await token.payout({from: owner});
        assert.equal(true, true);
    }); 

    
    //TODO test does not work for whatever reason
    it("other accounts can not request payout", async () => {
        await token.authorizeBoard(board, {from: admin});
        truffleAssert.reverts(token.payout({from: board}));
    }); 

    it("owner can pause token contract", async () => {
        await token.authorizeBoard(board, {from: admin});
        await token.deactivate({from: owner});
        // erc721 functions (e.g. minting) should no longer be possible
        truffleAssert.reverts(token.mint({from: board}));

        await token.activate({from: owner});
        let tokenId = web3.utils.toBN(await token.mint.call({from: board}));
        assert.equal(tokenId, 0);
    });

    it("any other account should not be able to pause contract", async () => {
        truffleAssert.reverts(token.deactivate({from: otherBoard}));
    });

    it("any other account should not be able to activate deactivated contract", async () => {
        await token.deactivate({from: owner});
        truffleAssert.reverts(token.activate({from: otherBoard}));
    });
})