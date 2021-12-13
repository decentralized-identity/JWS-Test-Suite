# JsonWebSignature2020 & VC JWT Test Suite

[![CI](https://github.com/decentralized-identity/JWS-Test-Suite/actions/workflows/ci.yml/badge.svg)](https://github.com/decentralized-identity/JWS-Test-Suite/actions/workflows/ci.yml)

## [Implementation Report](https://identity.foundation/JWS-Test-Suite/#implementations)

See [dif-grant-1-jws-test-suite](https://blog.identity.foundation/dif-grant-1-jws-test-suite/).

The purpose of this test suite is to enable interoperability testing across
implementations of [https://w3id.org/security/suites/jws-2020](https://w3id.org/security/suites/jws-2020).

This suite is used to create verifiable credentials and presentations that conform to the [VC Data Model](https://www.w3.org/TR/vc-data-model/).

This test suite does not currently support VC-JWT, even though some implementations may also support it.

## Usage

```
npm i
npm run build
npm run report:clean
npm run report:generate
npm run report:evaluate
```

### Build an Implementation

```
docker-compose build transmute
```

### Create a Credential with an Implementation

```bash

IMPLEMENTATION=transmute
INPUT=/data/credentials/credential-0.json
KEY=/data/keys/key-0-ed25519.json
OUTPUT=/data/implementations/$IMPLEMENTATION/credential-0--key-0-ed25519.json

docker-compose run $IMPLEMENTATION \
credential create \
--input $INPUT \
--output $OUTPUT \
--key $KEY
```

### Create a Presentation with an Implementation

```bash

IMPLEMENTATION=transmute
INPUT=/data/presentations/presentation-0.json
KEY=/data/keys/key-0-ed25519.json
OUTPUT=/data/implementations/$IMPLEMENTATION/presentation-0--key-0-ed25519.json

docker-compose run $IMPLEMENTATION \
presentation create \
--input $INPUT \
--output $OUTPUT \
--key $KEY
```

### Verify a Credential with an Implementation

```bash

IMPLEMENTATION=transmute
INPUT=/data/implementations/$IMPLEMENTATION/credential-0--key-0-ed25519.json
OUTPUT=/data/implementations/$IMPLEMENTATION/credential-0--key-0-ed25519.test.verification.json

docker-compose run $IMPLEMENTATION \
credential verify \
--input $INPUT \
--output $OUTPUT
```

### Verify a Presentation with an Implementation

```bash

IMPLEMENTATION=transmute
INPUT=/data/implementations/$IMPLEMENTATION/presentation-0--key-0-ed25519.json
OUTPUT=/data/implementations/$IMPLEMENTATION/presentation-0--key-0-ed25519.test.verification.json

docker-compose run $IMPLEMENTATION \
presentation verify \
--input $INPUT \
--output $OUTPUT
```
