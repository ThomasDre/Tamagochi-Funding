const Tamagochi = artifacts.require("Tamagochi");
const Board = artifacts.require("Board");
const Fundraising = artifacts.require("Fundraising");

module.exports = function(deployer) {
    deployer.deploy(Tamagochi);
    deployer.deploy(Board);
    deployer.deploy(Fundraising);
};