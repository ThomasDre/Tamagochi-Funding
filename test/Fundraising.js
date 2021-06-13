const truffleAssert = require('truffle-assertions');

const Fundraising = artifacts.require("Fundraising");
const TamagochiToken = artifacts.require("TamagochiToken");


contract("Fundraising test", async accounts => {
    
    let owner = accounts[0];
    let admin = accounts[1];
    let fundraisingHead = accounts[2];
    let otherBoard = accounts[3];
    let pseudoAddress = accounts[5];
    let accountant = accounts[6];
    let boardMaster = accounts[7];
    let otherEmployee = accounts[8];
    let customer = accounts[9];


    const ADMIN_ROLE = web3.utils.keccak256("ADMIN");
    const FUNDHEAD_ROLE = web3.utils.keccak256("FUNDRAISING_HEAD");     
    const ACCOUNTANT_ROLE = web3.utils.keccak256("ACCOUNTANT_ROLE");    
    const BOARDMASTER_ROLE = web3.utils.keccak256("BOARDMASTER");  

    const ITEM_NAME = "Test Item";
    const ITEM_PRICE = 100000000;
    const ITEM_FOOD = 100;
    const ITEM_CARE = 200;
    const ITEM_ENTERTAINMENT = 300;
    const ITEM_EDUCATION = 400;

    const DELETED_STRING_DEFAULT = "";
    const DELETED_NUM_DEFAULT = 0;

    const CUSTOM_WELL_FED_OPTIMUM = 1111;
    const CUSTOM_WELL_CARED_OPTIMUM = 2222;
    const CUSTOM_WELL_ENTERTAINED_OPTIMUM = 3333;
    const CUSTOM_WELL_EDUCATED_OPTIMUM = 4444;

    const TOKEN_PRICE = 10000;
    const RESET_PRICE = 20000;

    let token;
    let fundraising;

    async function initAndDeploy() {
        token = await TamagochiToken.new(admin);
        fundraising = await Fundraising.new(token.address);
        await token.authorizeBoard(fundraising.address, {from: owner});
    }

    beforeEach("deploy and init", async () => {
        await initAndDeploy();
    });


    it("owner should be able to set the token contract address", async () => {
        await fundraising.initTokenContract(pseudoAddress, {from: owner});
        assert.equal(await fundraising.tamagochiToken(), pseudoAddress);
    });

    it("non-owner should not be able to set the token contract address", async () => {
        truffleAssert.reverts(fundraising.initTokenContract(pseudoAddress, {from: fundraisingHead}));
    });

    it("owner should be able to set the fundraising head of board", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        assert.equal(await fundraising.hasRole(FUNDHEAD_ROLE, fundraisingHead), true);
    });

    it("non-owner should not be able to set the fundraising head of board", async () => {
        truffleAssert.reverts(fundraising.setFundraisingHead(fundraisingHead, {from: fundraisingHead}));
    });

    it("fundraising head can add people to accountant roles", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(ACCOUNTANT_ROLE, accountant), true);
    });

    it("fundraising head can add people to board master roles", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(BOARDMASTER_ROLE, boardMaster), true);
    });

    it("non-fundraising head can not add people to accountant roles", async () => {
        truffleAssert.reverts(fundraising.addAccountant(accountant, {from: otherBoard}));
        assert.equal(await fundraising.hasRole(ACCOUNTANT_ROLE, accountant), false);
    });

    it("non-fundraising head can not add people to board master roles", async () => {
        truffleAssert.reverts(fundraising.addBoardMaster(boardMaster, {from: otherBoard}));
        assert.equal(await fundraising.hasRole(BOARDMASTER_ROLE, boardMaster), false);
    });

    it("fundraising head can remove people from accountant roles", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(ACCOUNTANT_ROLE, accountant), true);
        await fundraising.removeAccountant(accountant, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(ACCOUNTANT_ROLE, accountant), false);
    });

    it("fundraising head can remove people from board master roles", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(BOARDMASTER_ROLE, boardMaster), true);
        await fundraising.removeBoardMaster(boardMaster, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(BOARDMASTER_ROLE, boardMaster), false);
    });

    it("non-fundraising head can not remove people from accountant roles", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        await fundraising.addAccountant(otherEmployee, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(ACCOUNTANT_ROLE, accountant), true);
        assert.equal(await fundraising.hasRole(ACCOUNTANT_ROLE, otherEmployee), true);
        truffleAssert.reverts(fundraising.removeAccountant(accountant, {from: otherEmployee}));
        assert.equal(await fundraising.hasRole(ACCOUNTANT_ROLE, accountant), true);
    });

    it("non-fundraising head can not remove people from board master roles", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.addBoardMaster(otherEmployee, {from: fundraisingHead});
        assert.equal(await fundraising.hasRole(BOARDMASTER_ROLE, boardMaster), true);
        assert.equal(await fundraising.hasRole(BOARDMASTER_ROLE, otherEmployee), true);
        truffleAssert.reverts(fundraising.removeAccountant(boardMaster, {from: otherEmployee}));
        assert.equal(await fundraising.hasRole(BOARDMASTER_ROLE, boardMaster), true);
    });

    it("accountant can set token price", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        await fundraising.setTokenPrice(TOKEN_PRICE, {from: accountant});
        assert.equal(await fundraising.tokenPrice(), TOKEN_PRICE);
    });

    it("accountant can set reset price", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        await fundraising.setResetPrice(RESET_PRICE, {from: accountant});
        assert.equal(await fundraising.resetPrice(), RESET_PRICE);
    });

    it("non-accountant can not set token price", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        truffleAssert.reverts(fundraising.setTokenPrice(TOKEN_PRICE, {from: owner}));
        truffleAssert.reverts(fundraising.setTokenPrice(TOKEN_PRICE, {from: boardMaster}));
        truffleAssert.reverts(fundraising.setTokenPrice(TOKEN_PRICE, {from: customer}));
        assert.equal(await fundraising.tokenPrice(), 0);      // default unitialized
    });

    it("non-accountant can not set reset price", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});

        truffleAssert.reverts(fundraising.setResetPrice(RESET_PRICE, {from: owner}));
        truffleAssert.reverts(fundraising.setResetPrice(RESET_PRICE, {from: boardMaster}));
        truffleAssert.reverts(fundraising.setResetPrice(RESET_PRICE, {from: customer}));
        assert.equal(await fundraising.resetPrice(), 0);      // default unitialized
    });

    it("board-master can publish new item", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});

        await fundraising.publishItem(ITEM_NAME, ITEM_PRICE, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: boardMaster});
        items = await fundraising.getItems();

        assert.equal(items.length, 1);

        item = items[0];
        assert.equal(item["name"], ITEM_NAME);
        assert.equal(item["price"], ITEM_PRICE);
        assert.equal(item["food"], ITEM_FOOD);
        assert.equal(item["care"], ITEM_CARE);
        assert.equal(item["entertainment"], ITEM_ENTERTAINMENT);
        assert.equal(item["education"], ITEM_EDUCATION);
    });

    it("board-master can remove item", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});

        await fundraising.publishItem(ITEM_NAME, ITEM_PRICE, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: boardMaster});
        await fundraising.removeItem(0, {from: boardMaster});
        items = await fundraising.getItems();
        
        item = items[0];
        assert.equal(item["name"], DELETED_STRING_DEFAULT);
        assert.equal(item["price"], DELETED_NUM_DEFAULT);
        assert.equal(item["food"], DELETED_NUM_DEFAULT);
        assert.equal(item["care"], DELETED_NUM_DEFAULT);
        assert.equal(item["entertainment"], DELETED_NUM_DEFAULT);
        assert.equal(item["education"], DELETED_NUM_DEFAULT);
    });

    it("non-board-master can not publish new item", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});

        truffleAssert.reverts(fundraising.publishItem(ITEM_NAME, ITEM_PRICE, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: owner}));
        truffleAssert.reverts(fundraising.publishItem(ITEM_NAME, ITEM_PRICE, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: accountant}));
    });

    it("non-board-master can not remove item", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});

        await fundraising.publishItem(ITEM_NAME, ITEM_PRICE, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: boardMaster});
        truffleAssert.reverts(fundraising.removeItem(0, {from: owner}));
        truffleAssert.reverts(fundraising.removeItem(0, {from: accountant}));
    });

    it("accountant can set price of published item", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});

        await fundraising.publishItem(ITEM_NAME, ITEM_PRICE, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: boardMaster});

        let newItemPrice = 999;
        await fundraising.setItemPrice(0, newItemPrice, {from: accountant});

        let items = await fundraising.getItems();
        let item = items[0];
        assert.equal(item["price"], newItemPrice);
    });

    it("non-accountant can not set price of published item", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});

        await fundraising.publishItem(ITEM_NAME, ITEM_PRICE, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: boardMaster});

        let newItemPrice = 999;
        truffleAssert.reverts(fundraising.setItemPrice(0, newItemPrice, {from: owner}));
        truffleAssert.reverts(fundraising.setItemPrice(0, newItemPrice, {from: boardMaster}));
    });

    /**
     * INTEGRATION TESTS (INVOLVE A CALL TO TAMAGOCHI TOKEN)
     */
    it("board-master can customize board-specific well-fed optimum", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.customizeWellFedOptimum(CUSTOM_WELL_FED_OPTIMUM, {from: boardMaster});
        assert.equal(await token.getWellFedOptimum(fundraising.address), CUSTOM_WELL_FED_OPTIMUM);
    });

    it("board-master can customize board-specific well-care optimum", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.customizeWellCareOptimum(CUSTOM_WELL_CARED_OPTIMUM, {from: boardMaster});
        assert.equal(await token.getWellCareOptimum(fundraising.address), CUSTOM_WELL_CARED_OPTIMUM);
    });

    it("board-master can customize board-specific well-entertained optimum", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.customizeWellEntertainedOptimum(CUSTOM_WELL_ENTERTAINED_OPTIMUM, {from: boardMaster});
        assert.equal(await token.getWellEntertainedOptimum(fundraising.address), CUSTOM_WELL_ENTERTAINED_OPTIMUM);
    });

    it("board-master can customize board-specific well-educated optimum", async () => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.customizeWellEducatedOptimum(CUSTOM_WELL_EDUCATED_OPTIMUM, {from: boardMaster});
        assert.equal(await token.getWellEducatedOptimum(fundraising.address), CUSTOM_WELL_EDUCATED_OPTIMUM);
    });

    /*
    it("customers can buy tokens", async() => {
        // TODO fix token
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        await fundraising.setTokenPrice(TOKEN_PRICE, {from: accountant});

        await fundraising.buyToken({from: customer, value: TOKEN_PRICE});
        truffleAssert.eventEmitted
        await fundraising.buyToken({from: customer, value: TOKEN_PRICE});

        assert.equal(token1 != token2, true);
        
        let tokenBalance = await token.balanceOf(customer, {from: customer});
        assert.equal(tokenBalance, 2);

        assert.equal(await token.ownerOf(token1, {from: customer}), customer);
        assert.equal(await token.ownerOf(token2, {from: customer}), customer);
    }); */

    it("token price must be set before they can be bought", async() => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        truffleAssert.reverts(fundraising.buyToken({from: customer, value: TOKEN_PRICE}));
    });

    it("customers can buy a item for one of their token", async() => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        // TODO
    });

    /*
    it("item price must be set before they can be bought", async() => {
         TODO fix token bug
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});
        await fundraising.setTokenPrice(TOKEN_PRICE, {from: accountant});

        await fundraising.publishItem(ITEM_NAME, 0, ITEM_FOOD, ITEM_CARE, ITEM_ENTERTAINMENT, ITEM_EDUCATION, {from: boardMaster});

        let token1 = new web3.utils.BN(await fundraising.buyToken({from: customer, value: TOKEN_PRICE}));
        truffleAssert.reverts(fundraising.buyItem(0, token1, {from: customer, value: 10000}));
    })
    */

    it("fundraising-head can request payout", async() => {
        // TODO 
    });

    it("others can not request a payout", async() => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});

        truffleAssert.reverts(fundraising.payout({from: owner}));
        truffleAssert.reverts(fundraising.payout({from: boardMaster}));
        truffleAssert.reverts(fundraising.payout({from: accountant}));
    });

    it("others cannot deactivate board", async() => {
        await fundraising.setFundraisingHead(fundraisingHead, {from: owner});
        await fundraising.addBoardMaster(boardMaster, {from: fundraisingHead});
        await fundraising.addAccountant(accountant, {from: fundraisingHead});

        truffleAssert.reverts(fundraising.deactivate({from: fundraisingHead}));
        truffleAssert.reverts(fundraising.deactivate({from: boardMaster}));
        truffleAssert.reverts(fundraising.deactivate({from: accountant}));
    });

    it("admin can deactivate board", async() => {
        await fundraising.deactivate({from: owner});
        truffleAssert.reverts(fundraising.getItems());
    });
})