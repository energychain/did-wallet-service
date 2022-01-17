"use strict";
const axios = require("axios");
const JWTBuilder = require("./../../../lib/JWTBuilder.js");
const JWTResolver = require("./../../../lib/JWTResolver.js");
const Identity = require("./../../../lib/Identity.js");
jest.setTimeout(30000);

const postJWT = async (jwt) => {
  try {
    return (await axios.post("http://127.0.0.1:3000/api/jwt/input",{did:jwt})).data;
  } catch (e) {
    return [];
  }
};

const postToJWT = async (to,jwt) => {
  try {
    return (await axios.post("http://127.0.0.1:3000/api/jwt/input",{did:jwt,wallet:to})).data;
  } catch (e) {
    return [];
  }
};

describe("Test Client", () => {
  const parent = {};
  beforeAll(() => {
    const identity = new Identity();
      parent.config = {
        identity:identity.getIdentity()
      };
  });
	describe("Register Wallet", () => {
		it("ping and pong", async () => {
      let builder = new JWTBuilder(parent.config);
      let payload = { "type": "CONTRL","ping": new Date().getTime() };
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postJWT(jwt));
      parent.config.wallet = {
        address:did.signer.blockchainAccountId.substr(0,42),
        publicKey:did.issuer.substr(9)
      }
      expect(did.payload.pong).toBeGreaterThan(did.payload.ping);
		});
    it("Sign Data", async () => {
      let builder = new JWTBuilder(parent.config);
      let payload = { "type": "CONTRL","sign": {time:new Date().getTime(),hello:'world'}};
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postJWT(jwt));
      expect(did.payload.hello).toBe('world');
      expect(did.issuer).toBe('did:ethr:'+parent.config.wallet.publicKey);
    });
    it("Present to", async () => {
      const identity = new Identity();
      let builder = new JWTBuilder({identity:identity.getIdentity()});
      let payload = { "hello": "world"};
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postToJWT(parent.config.wallet.address,jwt));
      expect(did.payload.type).toBe('CONTRL');
    });
    it("Presentations", async () => {
      let builder = new JWTBuilder(parent.config);
      let payload = { "type": "CONTRL","listPresentations": true};
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postJWT(jwt));
      console.log(did);
      expect(did.issuer).toBe('did:ethr:'+parent.config.wallet.publicKey);
    });
	});

});
