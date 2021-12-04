const keyJson = require("../../../data/keys/key-0-ed25519.json");
const credentialWithoutProof = require("../../../data/credentials/credential-3.json");
const { verifiable } = require("@transmute/vc.js");
const {
  JsonWebSignature,
  JsonWebKey,
} = require("@transmute/json-web-signature");

const { documentLoader } = require("../services");

describe("vc-data-model", () => {
  let vcJwt;
  let vcLd;

  beforeAll(async () => {
    const { items } = await verifiable.credential.create({
      credential: credentialWithoutProof,
      suite: new JsonWebSignature({
        key: await JsonWebKey.from(keyJson),
        date: credentialWithoutProof.issuanceDate,
      }),
      documentLoader,
      format: ["vc", "vc-jwt"],
    });
    [vcLd, vcJwt] = items;
    vcJwt = verifiable.jwt.decode(vcJwt);
  });

  describe("issuanceDate", () => {
    it("LD supports bi-directional lossless conversion of issuanceDate", async () => {
      expect(vcLd.issuanceDate).toEqual(credentialWithoutProof.issuanceDate);
      expect(vcLd.proof.created).toEqual(credentialWithoutProof.issuanceDate);
    });
    it("JWT supports bi-directional lossless conversion of issuanceDate", () => {
      expect(vcJwt.payload.vc.issuanceDate).toEqual(
        credentialWithoutProof.issuanceDate
      );
    });
  });

  describe("expirationDate", () => {
    it("LD supports bi-directional lossless conversion expirationDate", async () => {
      expect(vcLd.expirationDate).toEqual(
        credentialWithoutProof.expirationDate
      );
    });
    it("JWT supports bi-directional lossless conversion expirationDate", () => {
      expect(vcJwt.payload.vc.issuanceDate).toEqual(
        credentialWithoutProof.issuanceDate
      );
    });
  });

  describe("issuer", () => {
    it("LD Proof preserves all JSON", async () => {
      expect(vcLd.issuer).toEqual(credentialWithoutProof.issuer);
    });
    it("JWT Proof preserves all JSON", () => {
      expect(vcJwt.payload.vc.issuer).toEqual(credentialWithoutProof.issuer);
    });
  });

  describe("credentialSubject", () => {
    it("LD Proof preserves all JSON", async () => {
      expect(vcLd.credentialSubject).toEqual(
        credentialWithoutProof.credentialSubject
      );
    });
    it("JWT Proof preserves all JSON", () => {
      expect(vcJwt.payload.vc.credentialSubject).toEqual(
        credentialWithoutProof.credentialSubject
      );
    });
  });
});
