const JWTBuilder = require("./JWTBuilder.js");
const JWTResolver = require("./JWTResolver.js");
const Identity = require("./Identity.js");
const JWTDecode = require('jsontokens').decodeToken;

const WebClient = {
  JWTBuilder:JWTBuilder,
  JWTResolver:JWTResolver,
  JWTDecode:JWTDecode,
  Identity:Identity
}
module.exports=WebClient
