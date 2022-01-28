const fs = require("fs");

const loadJsonFile = (absolutePath) => {
  return JSON.parse(fs.readFileSync(absolutePath).toString());
};

const { createVcJwt } = require("./createVcJwt");

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

module.exports = {
  createVerifiableCredential,
};
