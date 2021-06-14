const Board = artifacts.require("Board");
const Tamagochi = artifacts.require("TamagochiToken");
const Fundraising = artifacts.require("Fundraising");


module.exports = async function(deployer) {
    await deployer.deploy(Board);
    await deployer.deploy(Tamagochi, Board.address);
    board = await Board.deployed();
    board.setTokenContractAddress(Tamagochi.address);
    /*.then(function() {
        return deployer.deploy(Tamagochi, Board.address);
    });*/


    
    // TODO this deplyoment is only meant for dev (convenience of getting an abi for testing)
    //deployer.deploy(Fundraising);
};