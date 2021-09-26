const contexts = {
  "https://www.w3.org/2018/credentials/v1": require("./credentials-v1.json"),
  "https://w3id.org/security/suites/jws-2020/v1": require("./jws-2020-v1.json"),
  "https://identity.foundation/presentation-exchange/submission/v1": require("./pex-v1.json"),
};

module.exports = { contexts };
