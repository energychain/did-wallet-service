const ethers = require("ethers");
const EthrDID = require("ethr-did").EthrDID;


class Identity {
  constructor(config) {
    if((typeof config == 'undefined') || (config == null)) config = {};

    if(typeof config.rpcUrl == 'undefined') config.rpcUrl  = "https://integration.corrently.io/";
    if(typeof config.name == 'undefined') config.name = "mainnet";
    if(typeof config.chainId == 'undefined') config.chainId = "6226";
    if(typeof config.registry == 'undefined') config.registry ="0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335";

    if(typeof config.identity == 'undefined') {
      config.identity = EthrDID.createKeyPair();
    }

    const parent = this;

    this.getIdentity = function() {
      const identity = EthrDID.createKeyPair();
      parent.identity = identity;
      return identity;
    }

    this.delegate = async function(to,type) {
      const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(config.identity.privateKey,provider);
      const ethrDid = new EthrDID({txSigner:wallet,provider:provider,identifier:config.identity.identifier,registry:config.registry});
      return await ethrDid.addDelegate(to);
    }

    this.changeOwner = async function(to) {
      const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(config.identity.privateKey,provider);
      const ethrDid = new EthrDID({txSigner:wallet,provider:provider,identifier:config.identity.identifier,registry:config.registry});
      return await ethrDid.changeOwner(to);
    }

    this.resolve = async function(addr) {
      const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(config.identity.privateKey,provider);
      const ethrDid = new EthrDID({txSigner:wallet,provider:provider,identifier:config.identity.identifier,registry:config.registry});
      return await ethrDid.resolve(addr);
    }
  }
}
module.exports = Identity;
