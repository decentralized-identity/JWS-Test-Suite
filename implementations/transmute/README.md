### Docker

#### Build CLI

```
docker build . -t transmute/jws-test-suite-cli
```

#### Run CLI

Be extra careful with pathes here...

```
export PROJECT_DATA=$(pwd)../../../data;
docker run -v $PROJECT_DATA:/data -t transmute/jws-test-suite-cli \
credential create \
--input $PROJECT_DATA/credentials/credential-0.json \
--output $PROJECT_DATA/implementations/transmute/credential.test.json \
--key $PROJECT_DATA/keys/key-0-ed25519.json
```

#### Testing the CLI without Docker

```
export PROJECT_DATA=../../data;
node ./bin.js \
credential create \
--input $PROJECT_DATA/credentials/credential-0.json \
--output $PROJECT_DATA/implementations/transmute/credential.test.json \
--key $PROJECT_DATA/keys/key-0-ed25519.json
```

```
export PROJECT_DATA=../../data;
node ./bin.js \
presentation create \
--input $PROJECT_DATA/presentations/presentation-0.json \
--output $PROJECT_DATA/implementations/transmute/presentation.test.json \
--key $PROJECT_DATA/keys/key-0-ed25519.json
```

```
export PROJECT_DATA=../../data;
node ./bin.js \
presentation create \
--input $PROJECT_DATA/presentations/presentation-2.json \
--output $PROJECT_DATA/implementations/transmute/presentation.test.json \
--key $PROJECT_DATA/keys/key-0-ed25519.json
```
