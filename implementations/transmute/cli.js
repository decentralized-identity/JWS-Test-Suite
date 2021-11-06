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
  let outputJson = verifiableCredential;
  if (format.includes("jwt")) {
    outputJson = { jwt: verifiableCredential };
  }
  fs.writeFileSync(output, JSON.stringify(outputJson, null, 2));
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
  let outputJson = verifiablePresentation;
  if (format.includes("jwt")) {
    outputJson = { jwt: verifiablePresentation };
  }
  fs.writeFileSync(output, JSON.stringify(outputJson, null, 2));
};

const verify = async (data, format) => {
  let result = { verified: false };
  try {
    if (format === "vc" || format === "vc-jwt") {
      result = await verifiable.credential.verify({
        credential: data,
        suite: new JsonWebSignature(),
        documentLoader,
        format: [format],
      });
    }
    if (format === "vp" || format === "vp-jwt") {
      let domain, challenge;
      if (format === "vp") {
        ({ domain, challenge } = data.proof);
      }
      if (format === "vp-jwt") {
        const [_1, _2, _3] = data.split(".");
        const payload = JSON.parse(Buffer.from(_2, "base64").toString());
        domain = payload.aud;
        challenge = payload.nonce;
      }
      result = await verifiable.presentation.verify({
        presentation: data,
        suite: new JsonWebSignature(),
        // normally you would want to make sure you trusted these...
        domain: domain,
        challenge: challenge,
        documentLoader,
        format: [format],
      });
    }
  } catch (e) {
    // hide errors.
    //
    // console.error(e);
    // console.log(format, e);
  }

  return result;
};

const verifyVerifiableCredential = async ({ input, output, format }) => {
  let credentialJson;
  try {
    credentialJson = loadJsonFile(input);
  } catch (e) {
    console.error("Could not load credential json from path: " + input);
    return;
  }
  const result = await verify(credentialJson, format);
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
};

const verifyVerifiablePresentation = async ({ input, output, format }) => {
  let presentationJson;
  try {
    presentationJson = loadJsonFile(input);
  } catch (e) {
    console.error("Could not load presentation json from path: " + input);
    return;
  }
  const result = await verify(presentationJson, format);
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
};

module.exports = {
  createVerifiableCredential,
  createVerifiablePresentation,
  verifyVerifiableCredential,
  verifyVerifiablePresentation,

  verify, // for use with evaluation report... no need for docker there.
};
