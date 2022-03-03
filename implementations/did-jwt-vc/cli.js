const fs = require("fs");

const loadJsonFile = (absolutePath) => {
  return JSON.parse(fs.readFileSync(absolutePath).toString());
};

const { createVcJwt, createVpJwt } = require("./did-jwt-vc-runner");

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

  if (format.includes("jwt")) {
    outputJson = { jwt: await createVcJwt(credentialJson, keyJson) };
  } else {
    outputJson = { jwt: "" };
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

  if (format.includes("jwt")) {
    outputJson = { jwt: await createVpJwt(presentationJson, keyJson) };
  } else {
    outputJson = { jwt: "" };
  }
  fs.writeFileSync(output, JSON.stringify(outputJson, null, 2));

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
  verifyVerifiablePresentation
};
