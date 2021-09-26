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

implementations.forEach((imp) => {
  keys.forEach((k) => {
    credentials.forEach((c) => {
      const credentialName = c.split(".json")[0];
      const keyName = k.split(".json")[0];

      const command = `
IMPLEMENTATION=${imp}
INPUT=/data/credentials/${c}
KEY=/data/keys/${k}
OUTPUT=/data/implementations/$IMPLEMENTATION/${credentialName}--${keyName}.json

docker-compose run -d $IMPLEMENTATION \
credential create \
--input $INPUT \
--output $OUTPUT \
--key $KEY
`;

      console.log(`${command}`);
      const { code, stdout } = shell.exec(command, { silent: true });
      if (code !== 0) {
        console.warn(stdout);
      }
    });

    presentations.forEach((p) => {
      const presentationName = p.split(".json")[0];
      const keyName = k.split(".json")[0];

      const command = `
IMPLEMENTATION=${imp}
INPUT=/data/presentations/${p}
KEY=/data/keys/${k}
OUTPUT=/data/implementations/$IMPLEMENTATION/${presentationName}--${keyName}.json

docker-compose run -d $IMPLEMENTATION \
presentation create \
--input $INPUT \
--output $OUTPUT \
--key $KEY
`;
      console.log(`${command}`);
      const { code, stdout } = shell.exec(command, { silent: true });
      if (code !== 0) {
        console.warn(stdout);
      }
    });
  });
});
