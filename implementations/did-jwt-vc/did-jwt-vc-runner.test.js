//const rawKeyJson = require("../../data/keys/key-1-secp256k1.json");
// const rawKeyJson = require("../../data/keys/key-2-secp256r1.json");
// const rawKeyJson = require("../../data/keys/key-4-rsa2048.json");

const rawKeyJson = require("../../data/keys/key-0-ed25519.json");

const credential = require("../../data/credentials/credential-1.json");
const presentation = require("../../data/presentations/presentation-0.json");
const { createVcJwt, createVpJwt, verifyVcJwt } = require("./did-jwt-vc-runner");

const vcJwt = "eyJraWQiOiJkaWQ6ZXhhbXBsZToxMjMja2V5LTAiLCJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5MjUwNjE4MDQsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eS9zdWl0ZXMvandzLTIwMjAvdjEiLHsiQHZvY2FiIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS8jIn1dLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDpleGFtcGxlOjEyMyIsImlzc3VhbmNlRGF0ZSI6IjIwMjEtMDEtMDFUMTk6MjM6MjRaIiwiZXhwaXJhdGlvbkRhdGUiOiIyMDMxLTAxLTAxVDE5OjIzOjI0WiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmV4YW1wbGU6NDU2IiwidHlwZSI6IlBlcnNvbiJ9fSwibmJmIjoxNjA5NTI5MDA0LCJpc3MiOiJkaWQ6ZXhhbXBsZToxMjMiLCJzdWIiOiJkaWQ6ZXhhbXBsZTo0NTYifQ.Mmyv3dqhlmgaMtsLnHvCXVCVTL4z2ymoyuxMQjyqi9ex0aziv66MbJBF1um_aPvj_0GIlsvlzlu-JZIpbezlCw"
describe("basicTests", () => {
  it("can create a simple vc-jwt", async () => {
    const jwt = await createVcJwt(credential, rawKeyJson);
    expect(jwt).toBeDefined();
  });

  it("can create a simple vp-jwt", async () => {
    const jwt = await createVpJwt(presentation, rawKeyJson);
    expect(jwt).toBeDefined();
  });

  it("can verify a simple vc-jwt", async () => {
    const result = await verifyVcJwt(vcJwt, "");
    expect(result).toBeDefined();
  });
});
