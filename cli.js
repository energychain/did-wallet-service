const axios = require("axios");
const JWTBuilder = require("./lib/JWTBuilder.js");
const Identity = require("./lib/Identity.js");

const app = async function() {
  const identity = new Identity();
  let builder = new JWTBuilder(await identity.getIdentity());
  let payload = { "hallo": "Welt" };
  let jwt = await builder.toJWT(payload);
  let result = await axios.post("http://0.0.0.0:3000/api/jwt/input",{did:jwt});
  console.log(result.data);
}

app();
