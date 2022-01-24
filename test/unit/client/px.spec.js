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

const APPLE_SCHEMA = {
  "$id": "https://corrently.io/schemas/test.schema.apple.json",
  "type": "object",
  "properties": {
    "cultivar": {
        "type": "string",
        "title": "Cultivar",
        "description": "Type of Apple",
        "enum":["Abram","Tamplin","Mutsu","Collins"]
    }
  },
  "required": ["cultivar"]
}

describe("Presentation Exchange", () => {
  const parent = {};
  beforeAll(() => {
    const identity = new Identity();
      parent.notary = {
        identity:identity.getIdentity()
      };
      parent.client = {
        identity:identity.getIdentity()
      };
      parent.trusty = {
        identity:identity.getIdentity()
      };
  });
	describe("Trusty gets approved data of client by notary", () => {
		it("Register Wallets - Get IDs", async () => {
      // notary
      let builder = new JWTBuilder(parent.notary);
      let payload = { "type": "CONTRL","ping": new Date().getTime() };
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postJWT(jwt));
      parent.notary.wallet = {
        address:did.signer.blockchainAccountId.substr(0,42),
        publicKey:did.issuer.substr(9)
      }
      expect(did.payload.pong).toBeGreaterThan(did.payload.ping);

      // client
      builder = new JWTBuilder(parent.client);
      payload = { "type": "CONTRL","ping": new Date().getTime() };
      jwt = await builder.toJWT(payload);
      resolver = new JWTResolver();
      did = await resolver.toDid(await postJWT(jwt));
      parent.client.wallet = {
        address:did.signer.blockchainAccountId.substr(0,42),
        publicKey:did.issuer.substr(9)
      }
      expect(did.payload.pong).toBeGreaterThan(did.payload.ping);

      // trusty
      builder = new JWTBuilder(parent.trusty);
      payload = { "type": "CONTRL","ping": new Date().getTime() };
      jwt = await builder.toJWT(payload);
      resolver = new JWTResolver();
      did = await resolver.toDid(await postJWT(jwt));
      parent.trusty.wallet = {
        address:did.signer.blockchainAccountId.substr(0,42),
        publicKey:did.issuer.substr(9)
      }
      expect(did.payload.pong).toBeGreaterThan(did.payload.ping);

		});
    it("register apple schema", async () => {
      
    });

  });
});
