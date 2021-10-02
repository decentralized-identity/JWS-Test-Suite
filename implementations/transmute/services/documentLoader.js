const { contexts } = require("./contexts");
const { dids } = require("./dids");
const documentLoader = (iri) => {
  if (contexts[iri]) {
    return { document: contexts[iri] };
  }

  const iriWithoutFragment = iri.split("#")[0];
  if (dids[iriWithoutFragment]) {
    return { document: dids[iriWithoutFragment] };
  }

  const message = "Transmute JWS Test Suite does not support: " + iri;
  console.error(message);
  throw new Error(message);
};

module.exports = { documentLoader };
