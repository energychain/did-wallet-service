const ethers = require("ethers");
const EthrDID = require("ethr-did").EthrDID;


class Identity {
  constructor(config) {
    if((typeof config == 'undefined') || (config == null)) { config = {}; }
    const parent = this;

    this.getIdentity = function() {
      const identity = EthrDID.createKeyPair();
      return identity;
    }
  }
}
module.exports = Identity;
