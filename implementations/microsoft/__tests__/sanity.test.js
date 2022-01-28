const {
  Crypto,
  CryptoBuilder,
  KeyUse,
  KeyReference,
  JoseBuilder,
  CryptoFactoryNode,
  KeyStoreInMemory,
  Subtle,
} = require("verifiablecredentials-crypto-sdk-typescript");

const rawKeyJson = require("../../../data/keys/key-1-secp256k1.json");
const credential = require("../../../data/credentials/credential-3.json");
describe("JWT", () => {
  it("should add standard props", async () => {
    const keyRef = new KeyReference(rawKeyJson.id.split("#").pop());
    const keyStore = new KeyStoreInMemory();
    await keyStore.save(keyRef, rawKeyJson.privateKeyJwk);
    let crypto = new CryptoBuilder()
      .useCryptoFactory(new CryptoFactoryNode(keyStore, new Subtle()))
      .useDid(rawKeyJson.controller)
      .useSigningKeyReference(keyRef)
      .build();

    let jwt = new JoseBuilder(crypto)
      .useJwtProtocol({ jti: credential.id, nbf: 456, exp: 123 })
      .build();

    const payload = { iss: credential.issuer.id, vc: credential };
    jwt = await jwt.sign(payload);
    const token = await jwt.serialize();
    // console.log(token);
    expect(token).toBeDefined();
  });
});
