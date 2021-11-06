console.log("\n💎 Preparing implementations report...\n");

const path = require("path");
const fs = require("fs");
const shell = require("shelljs");

const ignoreImplementations = ["mock"];

const implementationPath = path.join(__dirname, "./implementations");
const keysPath = path.join(__dirname, "./data/keys");
const credentialsPath = path.join(__dirname, "./data/credentials");
const presentationsPath = path.join(__dirname, "./data/presentations");

const implementations = fs.readdirSync(implementationPath).filter((i) => {
  return !ignoreImplementations.includes(i);
});

const keys = fs.readdirSync(keysPath);
const credentials = fs.readdirSync(credentialsPath);
const presentations = fs.readdirSync(presentationsPath);

const credentialFormats = ["vc", "vc-jwt"];
const presentationFormats = ["vp", "vp-jwt"];

const focusedImplementations = implementations.filter((imp) => {
  // test one...
  // return imp === "transmute";
  // test all...
  return true;
});

const generateCredentials = (imp, k, f) => {
  credentials.forEach((c) => {
    const credentialName = c.split(".json")[0];
    const keyName = k.split(".json")[0];

    const command = `
IMPLEMENTATION=${imp}
INPUT=/data/credentials/${c}
KEY=/data/keys/${k}
FORMAT=${f}
OUTPUT=/data/implementations/$IMPLEMENTATION/${credentialName}--${keyName}.${f}.json

docker-compose run -d $IMPLEMENTATION \
credential create \
--input $INPUT \
--output $OUTPUT \
--key $KEY \
--format $FORMAT
`;

    console.log(`${command}`);
    const { code, stdout } = shell.exec(command, { silent: true });
    if (code !== 0) {
      console.warn(stdout);
    }
  });
};

const generatePresentations = (imp, k, f) => {
  presentations.forEach((p) => {
    const presentationName = p.split(".json")[0];
    const keyName = k.split(".json")[0];

    const command = `
IMPLEMENTATION=${imp}
INPUT=/data/presentations/${p}
KEY=/data/keys/${k}
FORMAT=${f}
OUTPUT=/data/implementations/$IMPLEMENTATION/${presentationName}--${keyName}.${f}.json

docker-compose run -d $IMPLEMENTATION \
presentation create \
--input $INPUT \
--output $OUTPUT \
--key $KEY \
--format $FORMAT
`;
    console.log(`${command}`);
    const { code, stdout } = shell.exec(command, { silent: true });
    if (code !== 0) {
      console.warn(stdout);
    }
  });
};

focusedImplementations.forEach((imp) => {
  keys.forEach((key) => {
    credentialFormats.forEach((format) => {
      generateCredentials(imp, key, format);
    });

    presentationFormats.forEach((format) => {
      generatePresentations(imp, key, format);
    });
  });
});
