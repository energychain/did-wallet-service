const EthrDID = require("ethr-did").EthrDID;

class JWTBuilder {
  constructor(config) {
    if((typeof config == 'undefined') || (config == null)) { config = {}; }
    this.config = config;

    this.toJWT = async function(object) {
      if((typeof object !== 'object')||(object == null)) {
        throw new Error('toJWT expects object');
      }

      const ethrDid = new EthrDID(config.identity);
      return await ethrDid.signJWT(object);
    }
  }
}
module.exports = JWTBuilder;
