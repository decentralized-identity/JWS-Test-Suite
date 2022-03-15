# JsonWebSignature2020 & VC JWT Test Suite

[![CI](https://github.com/decentralized-identity/JWS-Test-Suite/actions/workflows/ci.yml/badge.svg)](https://github.com/decentralized-identity/JWS-Test-Suite/actions/workflows/ci.yml)

## [Implementation Report](https://identity.foundation/JWS-Test-Suite/#implementations)

See [dif-grant-1-jws-test-suite](https://blog.identity.foundation/dif-grant-1-jws-test-suite/).

The purpose of this test suite is to enable interoperability testing across implementations
of [https://w3id.org/security/suites/jws-2020](https://w3id.org/security/suites/jws-2020).

This suite is used to create verifiable credentials and presentations that conform to
the [VC Data Model](https://www.w3.org/TR/vc-data-model/).

This test suite does not currently support VC-JWT, even though some implementations may also support it.

## Key Types & Signature Algorithms

As [defined in the suite](https://w3c-ccg.github.io/lds-jws2020/#jose-conformance) there are a number of supported key
types using [JsonWebKey2020](https://w3c-ccg.github.io/lds-jws2020/#json-web-key-2020) and corresponding signature
algorithms. The table below illustrates what this test suite supports for testing. Currently, there
are [four keys used in testing](https://github.com/decentralized-identity/JWS-Test-Suite/tree/main/data/keys):

| kty | crv or size       | signature |
|-----|-------------------|-----------|
| OKP | Ed25519           | EdDSA     |
| EC  | secp256k1         | ES256k    |
| EC  | secp256r1 / P-256 | ES256     |
| EC  | secp384r1 / P-384 | ES384     |
| RSA | 2048              | PS256     |

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

## Creating an Implementation

Anyone is welcome to submit an implementation. This suite uses [docker compose](https://docs.docker.com/compose/) to
simplify testing each
implementation. [A mock implementation is provided here](https://github.com/decentralized-identity/JWS-Test-Suite/tree/main/implementations/mock)
as a reference.

In preparing your submission, you'll need to do the following:

1. Create a new subdirectory in the `implementations` directory with your implementation.
2. Create a new subdirectory in the `data/implementations` directory for your implementation's output files.
3. Build your implementation in `implementations/{your-impl}` along with a working `Dockerfile` (details on
   functionality below).
4. Modify the [docker-compose](https://github.com/decentralized-identity/JWS-Test-Suite/blob/main/docker-compose.yml)
   file to list your implementation.

### Implementation Details

Your Docker image needs to support the following inputs, styled as a CLI, as called
from [generate.js](https://github.com/decentralized-identity/JWS-Test-Suite/blob/main/generate.js). It is not required
to support all keys, credentials, or presentations. If your implementation does not support one of the options called
during _generate_ it's advised to fail gracefully, and not write an empty output file.

1. **credential create**

Generates a credential using your implementation. Takes four arguments:

- `--input $INPUT` where `$INPUT` is a path to an _existing credential file_ such
  as `/data/credentials/credential-0.json`
- `--output $OUTPUT` where `$OUTPUT` is a path to a _file your implementation will create_ such
  as `data/implementations/$IMPLEMENTATION/credential-0--key-0-ed25519.json`
- `--key $KEY` where `$KEY` is a path to an _existing key file_ such as `/data/keys/key-0-ed25519.json`
- `--format $FORMAT` where `$FORMAT` is a either `vc` or `vc-jwt`

2. **credential verify**

Verifies a credential using your implementation. Takes four arguments:

- `--input $INPUT` where `$INPUT` is a path to an _existing signed credential file_ such
  as `/data/implementations/$IMPLEMENTATION/credential-0--key-0-ed25519.json`
- `--output $OUTPUT` where `$OUTPUT` is a path to a _file your implementation will create_ such
  as `/data/implementations/$IMPLEMENTATION/credential-0--key-0-ed25519.test.verification.json`

3. **presentation create**

Generates a presentation using your implementation. Takes four arguments:

- `--input $INPUT` where `$INPUT` is a path to an _existing presentation file_ such
  as `/data/presentations/presentation-0.json`
- `--output $OUTPUT` where `$OUTPUT` is a path to a _file your implementation will create_ such
  as `data/implementations/$IMPLEMENTATION/presentation-0--key-0-ed25519.json`
- `--key $KEY` where `$KEY` is a path to an _existing key file_ such as `/data/keys/key-0-ed25519.json`
- `--format $FORMAT` where `$FORMAT` is a either `vp` or `vp-jwt`

4. **presentation verify**

- `--input $INPUT` where `$INPUT` is a path to an _existing signed presentation file_ such
  as `/data/implementations/$IMPLEMENTATION/presentation-0--key-0-ed25519.json`
- `--output $OUTPUT` where `$OUTPUT` is a path to a _file your implementation will create_ such
  as `/data/implementations/$IMPLEMENTATION/presentation-0--key-0-ed25519.test.verification.json`

If your implementation supports both the plain (`vc`, `vp`) and JWT (`vc-jwt`, `vp-jwt`) variations you should
diff the output files for each credential and presentation and their verifications. The convention is as
follows:

For credentials...

`vc`: `credential-0--key-0-ed25519.vc.json`
`vc-jwt`: `credential-0--key-0-ed25519.vc-jwt.json`

For presentations...

`vp`: `presentation-0--key-0-ed25519.vp.json`
`vp-jwt`: `presentation-0--key-0-ed25519.vp-jwt.json`


### Note on JWT Representations

The JWT representations: `vc-jwt` and `vp-jwt` _do not_ use the Linked Data signature process described
in the `JsonWebSignature2020` specification. Instead, for signing and verifying JWT representations, standard
[JOSE](https://jose.readthedocs.io/en/latest/) is used. The key type and algorithm specified for signing and verifying
are consistent with the `JsonWebKey2020` representations found in this test suite.

### Generating Your Implementation Files

To simplify generation of your implementation's signed files you can use the command `npm run report:generate`. If wish
to only run your implementation, you can modify the (`focusedImplementations` value
here)[https://github.com/decentralized-identity/JWS-Test-Suite/blob/main/generate.js#L25].

### Testing Your Implementation

To test your implementation you can verify the credentials and presentations your implementation generates against other
implementations. At present, the `transmute` implementation is authoritative for all verifications except for
credentials signed with RSA-2048 keys using PS256. For RSA credentials and presentations, test against `spruce`.

The only thing tested by the suite are valid signatures for a given proof type. This means using the `proofPurpose`
of `assertionMethod` for credentials, and the type of `authentication` for presentations, where a `challenge` value must
be present.

Example commands can be found above.