### Transmute

This directory contains the source behind the dockerizedd CLI of the
[Transmute](https://github.com/transmute-industries/verifiable-data) implementation of [VC Data Model](https://www.w3.org/TR/vc-data-model/).

#### Conformance Results

Test results for this implementation are available [Conformance Results](https://identity.foundation/JWS-Test-Suite/#transmute).

### Development

There are 3 layers to this implementation:

1. The [node.js library](./cli.js)
1. The [node.js cli](./bin.js)
1. The [dockerized cli](./Dockerfile)

When developing an implementation you should start by
testing your library methods without a cli or docker.

Be especially aware of file paths when developing an implementation.

## Node CLI

This section applies to developing the node.js (or other language) cli for your implementation.

These commands MUST be run from the [current directory working directory](.).

Note that the paths are absolute and are to files in this repository on your operating system.

#### Build

```
npm i
```

#### Create Credential

```
export PROJECT_DATA=../../data;
node ./bin.js \
credential create \
--input $PROJECT_DATA/credentials/credential-0.json \
--output $PROJECT_DATA/implementations/transmute/credential.test.json \
--key $PROJECT_DATA/keys/key-0-ed25519.json
```

#### Verify Credential

```
export PROJECT_DATA=../../data;
node ./bin.js \
credential verify \
--input $PROJECT_DATA/implementations/transmute/credential.test.json \
--output $PROJECT_DATA/implementations/transmute/credential.test.verification.json
```

## Docker CLI

This section applies to developing the docker cli for your implementation.

#### Build

This builds and tags a docker image for your implementation.

This image should be registered the root directory [docker-compose](../../docker-compose.yml).

```
docker build . -t transmute/jws-test-suite-cli
```

#### Run

You can run you docker cli without using docker compose.

Be especially careful with file paths when doing this.

These commands MUST be run from the [ROOT directory of this repository](../..).

Note that the paths are to the mounted directory and are absolute.

##### Create Credential

```
export PROJECT_DATA=$(pwd)/data;
docker run -v $PROJECT_DATA:/data -t transmute/jws-test-suite-cli \
credential create \
--input /data/credentials/credential-0.json \
--output /data/implementations/transmute/credential.test.json \
--key /data/keys/key-0-ed25519.json
```

##### Verify a Credential

```
export PROJECT_DATA=$(pwd)/data;
docker run -v $PROJECT_DATA:/data -t transmute/jws-test-suite-cli \
credential verify \
--input /data/implementations/transmute/credential.test.json \
--output /data/implementations/transmute/credential.test.verification.json
```
