const key0 = require("../../../data/keys/key-0-ed25519.json");
const key1 = require("../../../data/keys/key-1-secp256k1.json");
const key2 = require("../../../data/keys/key-2-secp256r1.json");
const key3 = require("../../../data/keys/key-3-secp384r1.json");

const keys = [key0, key1, key2, key3];

const doc = {
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
  ],
  id: "did:example:123",
  verificationMethod: [],
  assertionMethod: [],
  authentication: [],
};

keys.forEach((key) => {
  delete key.privateKeyJwk;
  doc.verificationMethod.push(key);
  doc.assertionMethod.push(key.id);
  doc.authentication.push(key.id);
});

const dids = {
  "did:example:123": doc,
};

module.exports = { dids };
