const { contexts } = require("./contexts");

const documentLoader = (iri) => {
  if (contexts[iri]) {
    return { document: contexts[iri] };
  }
  const message = "Transmute JWS Test Suite does not support: " + iri;
  console.error(message);
  throw new Error(message);
};

module.exports = { documentLoader };
