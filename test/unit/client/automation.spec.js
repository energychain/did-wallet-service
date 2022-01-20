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

const getBuffer = async () => {
  try {
    return (await axios.get("http://127.0.0.1:3000/api/dummy/buffer")).data;
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

describe("Test Automation", () => {
  const parent = {};
  beforeAll(() => {
    const identity = new Identity();
      parent.config = {
        identity:identity.getIdentity()
      };
      parent.partner = {
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
    it("register apple schema", async () => {
      let builder = new JWTBuilder(parent.config);
      let payload = { "type": "CONTRL","addSchema": APPLE_SCHEMA };
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postJWT(jwt));
      expect(did.payload.type).toBe('CONTRL');
      expect(did.payload.schema).not.toBeUndefined();
      parent.schemaOfApple = did.payload.schema;
    });
    it("register apple webhook", async () => {
      let builder = new JWTBuilder(parent.config);
      let payload = { "type": "CONTRL","addWebhook": {
        schema:parent.schemaOfApple,
        url:'http://0.0.0.0:3000/api/dummy/buffer?info=apple'
      } };
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postJWT(jwt));
      expect(did.payload.type).toBe('CONTRL');
    });
    it("Present an Apple", async () => {
      let builder = new JWTBuilder(parent.partner);
      let payload =  {"cultivar":"Abram"}; // Is an Apple
      let jwt = await builder.toJWT(payload);
      let resolver = new JWTResolver();
      let did = await resolver.toDid(await postToJWT(parent.config.wallet.address,parent.schemaOfApple,jwt));
      // getBuffer
    });
    it("Validate Webhook Called", async () => {
      let buffer = await getBuffer();
      expect(buffer.length).toBeGreaterThan(0);
      let found = false;
      for(let i=0;i<buffer.length;i++) {
        if(buffer[i].presentation.issuer == 'did:ethr:'+parent.partner.identity.identifier) found=true;
      }
      expect(found).toBe(true);

      // getBuffer
    });
  });
});
