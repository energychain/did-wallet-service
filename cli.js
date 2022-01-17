const axios = require("axios");
const JWTBuilder = require("./lib/JWTBuilder.js");
const JWTResolver = require("./lib/JWTResolver.js");
const Identity = require("./lib/Identity.js");

function stringToBytes32 (str) {
  const buffstr = Buffer.from(str).toString('hex')
  return buffstr + '0'.repeat(64 - buffstr.length)
}

const TYPE_DIDJWT = stringToBytes32("");

const app = async function() {

  let appleSchema = {
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
  };

  let config = {
    identity: {
      address: '0x7E2B77d00Aaa7070ee559A642ce43cb45300eafe',
      privateKey: '0x01847f5e318a11106bdc10bd3548d3c86488635a12f9ad62f2b5fa9d16e217e5',
      publicKey: '0x036c475f10c28913ec63e133726242fd66829824cbaeeca1351d569d612dcd4e5c',
      identifier: '0x036c475f10c28913ec63e133726242fd66829824cbaeeca1351d569d612dcd4e5c'
    }

  };

  const identity = new Identity(config);

  let builder = new JWTBuilder(config);
  let payload = { "type": "CONTRL","addSchema": appleSchema };
  let jwt = await builder.toJWT(payload);
  let resolver = new JWTResolver();

  let result = await axios.post("http://0.0.0.0:3000/api/jwt/input",{did:jwt});

  let did = await resolver.toDid(result.data);
  console.log(did);

  payload = { "type": "CONTRL","listSchemas": true };
  let jwt2 = await builder.toJWT(payload);
  result = await axios.post("http://0.0.0.0:3000/api/jwt/input",{did:jwt2});

  let did2 = await resolver.toDid(result.data);
  console.log(did2);
/*
  payload = { "type": "CONTRL","sign": {'Hallo':'Welt'} };
  jwt2 = await builder.toJWT(payload);
  result = await axios.post("http://0.0.0.0:3000/api/jwt/input",{did:jwt2});
  did = await resolver.toDid(result.data);
  console.log(did);
*/

}

app();
