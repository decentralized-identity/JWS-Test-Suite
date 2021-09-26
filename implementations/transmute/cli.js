const fs = require("fs");

const { verifiable } = require("@transmute/vc.js");

const {
  JsonWebKey,
  JsonWebSignature,
} = require("@transmute/json-web-signature");

const { documentLoader } = require("./services");

const loadJsonFile = (absolutePath) => {
  return JSON.parse(fs.readFileSync(absolutePath).toString());
};

const createVerifiableCredential = async ({ input, output, key, format }) => {
  let credentialJson;
  try {
    credentialJson = loadJsonFile(input);
  } catch (e) {
    console.error("Could not load credential json from path: " + input);
    return;
  }
  try {
    keyJson = loadJsonFile(key);
  } catch (e) {
    console.error("Could not load key json from path: " + key);
    return;
  }
  const {
    items: [verifiableCredential],
  } = await verifiable.credential.create({
    credential: { ...credentialJson, issuer: keyJson.controller },
    suite: new JsonWebSignature({
      key: await JsonWebKey.from(keyJson),
    }),
    documentLoader,
    format: [format],
  });
  fs.writeFileSync(output, JSON.stringify(verifiableCredential, null, 2));
};

const createVerifiablePresentation = async ({ input, output, key, format }) => {
  let presentationJson;
  try {
    presentationJson = loadJsonFile(input);
  } catch (e) {
    console.error("Could not load presentation json from path: " + input);
    return;
  }
  try {
    keyJson = loadJsonFile(key);
  } catch (e) {
    console.error("Could not load key json from path: " + key);
    return;
  }
  const {
    items: [verifiablePresentation],
  } = await verifiable.presentation.create({
    presentation: { ...presentationJson, holder: keyJson.controller },
    suite: new JsonWebSignature({
      key: await JsonWebKey.from(keyJson),
    }),
    challenge: "123",
    documentLoader,
    format: [format],
  });
  fs.writeFileSync(output, JSON.stringify(verifiablePresentation, null, 2));
};

module.exports = { createVerifiableCredential, createVerifiablePresentation };
