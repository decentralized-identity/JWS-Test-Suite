const path = require("path");

const cli = require("./cli");

const getAbsolutePath = (relativePath) => {
  return path.resolve(__dirname, relativePath);
};

it("can create credential", async () => {
  const format = "vc";
  await cli.createVerifiableCredential({
    input: getAbsolutePath("../../data/credentials/credential-0.json"),
    output: getAbsolutePath(
      "../../data/implementations/transmute/credential.test.json"
    ),
    key: getAbsolutePath("../../data/keys/key-0-ed25519.json"),
    format,
  });
});

it("can create presentation", async () => {
  const format = "vp";
  await cli.createVerifiablePresentation({
    input: getAbsolutePath("../../data/presentations/presentation-0.json"),
    output: getAbsolutePath(
      "../../data/implementations/transmute/presentation.test.json"
    ),
    key: getAbsolutePath("../../data/keys/key-0-ed25519.json"),
    format,
  });
});
