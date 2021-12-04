const {
  CryptoBuilder,
  KeyReference,
  JoseBuilder,
  CryptoFactoryNode,
  KeyStoreInMemory,
  Subtle,
} = require("verifiablecredentials-crypto-sdk-typescript");
const moment = require("moment");

// See https://w3c.github.io/vc-data-model/#jwt-encoding
const createVcJwt = async (credential, key) => {
  const keyRef = new KeyReference(key.id.split("#").pop());
  const keyStore = new KeyStoreInMemory();
  await keyStore.save(keyRef, key.privateKeyJwk);
  const crypto = new CryptoBuilder()
    .useCryptoFactory(new CryptoFactoryNode(keyStore, new Subtle()))
    .useDid(key.controller)
    .useSigningKeyReference(keyRef)
    .build();

  const options = {};
  if (credential.id) {
    // jti MUST represent the id property of the verifiable credential or verifiable presentation.
    options.jti = credential.id;
  }
  if (credential.issuanceDate) {
    // nbf MUST represent issuanceDate, encoded as a UNIX timestamp (NumericDate).
    options.nbf = moment(credential.issuanceDate).unix();
  }

  if (credential.expirationDate) {
    // exp MUST represent the expirationDate property, encoded as a UNIX timestamp (NumericDate).
    options.exp = moment(credential.expirationDate).unix();
  }
  const joseSigner = new JoseBuilder(crypto).useJwtProtocol(options).build();

  const payload = { vc: credential };

  // iss MUST represent the issuer property of a verifiable credential or the holder property of a verifiable presentation.
  if (credential.issuer) {
    payload.iss =
      typeof credential.issuer === "string"
        ? credential.issuer
        : credential.issuer.id;
  }

  // sub MUST represent the id property contained in the credentialSubject.
  if (credential.credentialSubject.id) {
    payload.sub = credential.credentialSubject.id;
  }

  const jwt = await joseSigner.sign(payload);
  const token = await jwt.serialize();
  return token;
};

module.exports = { createVcJwt };
