### Example

Built with [microsoft/VerifiableCredentials-Crypto-SDK-Typescript](https://github.com/microsoft/VerifiableCredentials-Crypto-SDK-Typescript).

### Development

Run these commands from the root level.

```

IMPLEMENTATION=microsoft
INPUT=/data/credentials/credential-0.json
KEY=/data/keys/key-2-secp256r1.json
OUTPUT=/data/implementations/$IMPLEMENTATION/credential-0--key-2-secp256r1.json

docker-compose run $IMPLEMENTATION \
credential create \
--input $INPUT \
--output $OUTPUT \
--key $KEY
```
