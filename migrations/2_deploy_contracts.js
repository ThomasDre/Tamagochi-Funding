const Board = artifacts.require("Board");
const Tamagochi = artifacts.require("TamagochiToken");
const Fundraising = artifcats.require("Fundraising");


module.exports = function(deployer) {
    deployer.deploy(Board).then(function() {
        return deployer.deploy(Tamagochi, Board.address);
    });
    // TODO this deplyoment is only meant for dev (convenience of getting an abi for testing)
    deployer.deploy(Fundraising);

};