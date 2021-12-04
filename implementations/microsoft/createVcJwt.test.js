const rawKeyJson = require("../../data/keys/key-1-secp256k1.json");
const credential = require("../../data/credentials/credential-3.json");
const { createVcJwt } = require("./createVcJwt");
describe("createVcJwt", () => {
  it("can create a simple jwt", async () => {
    const jwt = await createVcJwt(credential, rawKeyJson);
    console.log(jwt);
  });
});
