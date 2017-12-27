var VotingStorage = artifacts.require("./Voting.sol");

module.exports = function(deployer) {
  deployer.deploy(VotingStorage,["Caskia","Lucy","Lily","Anya"]);
};
