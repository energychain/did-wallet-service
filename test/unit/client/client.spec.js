"use strict";
const axios = require("axios");
const JWTBuilder = require("did-wallet-web").JWTBuilder;
const JWTResolver = require("did-wallet-web").JWTResolver;
const Identity = require("did-wallet-web").Identity;
jest.setTimeout(30000);

const postJWT = async (jwt) => {
  try {
    return (await axios.post("http://127.0.0.1:3000/api/jwt/input",{did:jwt})).data;
  } catch (e) {
    return [];
  }
};

const postToJWT = async (to,schema,jwt) => {
  try {
    return (await axios.post("http://127.0.0.1:3000/api/jwt/input",{did:jwt,to:to,schema:schema})).data;
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
      let did = await resolver.toDid(await postToJWT(parent.config.wallet.address,'0x0',jwt));
      expect(did.payload.type).toBe('CONTRL');
      parent.presentationFromI2 = did.payload.presentation;
    });
    it("Presentations", async () => {
      let builder = new JWTBuilder(parent.config);
      let payload = { "type": "CONTRL","listPresentations": true};
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postJWT(jwt));
      expect(did.issuer).toBe('did:ethr:'+parent.config.wallet.publicKey);
      expect(did.payload.presentations[parent.presentationFromI2]).not.toBeUndefined();
      expect(did.payload.presentations[parent.presentationFromI2].signer.blockchainAccountId).not.toBe(parent.config.wallet.address);
    });
	});

});
