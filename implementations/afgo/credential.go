package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/pkg/errors"

	"github.com/hyperledger/aries-framework-go/pkg/doc/jose/jwk"
	"github.com/hyperledger/aries-framework-go/pkg/doc/jwt"
	jsonldsig "github.com/hyperledger/aries-framework-go/pkg/doc/signature/jsonld"
	"github.com/hyperledger/aries-framework-go/pkg/doc/signature/suite"
	"github.com/hyperledger/aries-framework-go/pkg/doc/signature/suite/jsonwebsignature2020"
	"github.com/hyperledger/aries-framework-go/pkg/doc/util/signature"
	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
	bddVerifiable "github.com/hyperledger/aries-framework-go/test/bdd/pkg/verifiable"
)

func CreateCredential(credFilePath, keyFilePath, outFilePath, format string) error {
	key, err := GetKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	cred, err := getCredentialFromFile(credFilePath)
	if err != nil {
		return err
	}
	privateKey, err := key.GetPrivateKeyJWK()
	if err != nil {
		return err
	}
	signer, err := signature.GetSigner(privateKey)
	if err != nil {
		return err
	}

	var credBytes []byte
	var credErr error
	switch format {
	case VerifiableCredentialFormat:
		credBytes, credErr = createCredential(key.Id, signer, cred)
	case VerifiableCredentialJWTFormat:
		credBytes, credErr = createJWTCredential(key.Id, privateKey, signer, cred)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if credErr != nil {
		return errors.Wrapf(credErr, "could not generate cred of format: %s", format)
	}
	return writeOutputToFile(credBytes, outFilePath)
}

func createCredential(KeyId string, signer verifiable.Signer, cred *verifiable.Credential) ([]byte, error) {
	documentLoader, err := bddVerifiable.CreateDocumentLoader()
	if err != nil {
		return nil, err
	}
	err = cred.AddLinkedDataProof(&verifiable.LinkedDataProofContext{
		SignatureType:           "JsonWebSignature2020",
		Suite:                   jsonwebsignature2020.New(suite.WithSigner(signer)),
		SignatureRepresentation: verifiable.SignatureJWS,
		Created:                 &cred.Issued.Time,
		VerificationMethod:      KeyId,
	}, jsonldsig.WithDocumentLoader(documentLoader))
	if err != nil {
		return nil, err
	}
	return json.MarshalIndent(cred, "", "    ")
}

func createJWTCredential(KeyId string, privateKey *jwk.JWK, signer verifiable.Signer, cred *verifiable.Credential) ([]byte, error) {
	keyType, err := privateKey.KeyType()
	if err != nil {
		return nil, err
	}
	jwsAlgo, err := verifiable.KeyTypeToJWSAlgo(keyType)
	if err != nil {
		return nil, err
	}
	claims, err := cred.JWTClaims(false)
	if err != nil {
		return nil, err
	}
	res, err := claims.MarshalJWS(jwsAlgo, signer, KeyId)
	if err != nil {
		return nil, err
	}
	jwtFile := JWTJSONFile{JWT: res}
	return json.MarshalIndent(jwtFile, "", "    ")
}

func VerifyCredential(credFilePath, keyFilePath, outFilePath, format string) error {
	key, err := GetKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	var verificationResult bool
	var verificationError error
	switch format {
	case VerifiableCredentialFormat:
		verificationResult, verificationError = verifyCredential(key, credFilePath)
	case VerifiableCredentialJWTFormat:
		verificationResult, verificationError = verifyJWTCredential(key, credFilePath)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if verificationError != nil {
		return verificationError
	}
	return writeVerificationResult(verificationResult, outFilePath)
}

func verifyCredential(key *Key, credFilePath string) (bool, error) {
	credFile, err := ioutil.ReadFile(credFilePath)
	if err != nil {
		return false, err
	}
	documentLoader, err := bddVerifiable.CreateDocumentLoader()
	if err != nil {
		return false, err
	}
	parsedVC, err := verifiable.ParseCredential(credFile,
		verifiable.WithPublicKeyFetcher(key.GetPublicKey),
		verifiable.WithEmbeddedSignatureSuites(
			jsonwebsignature2020.New(suite.WithVerifier(jsonwebsignature2020.NewPublicKeyVerifier()))),
		verifiable.WithJSONLDDocumentLoader(documentLoader))
	return parsedVC != nil, err
}

func verifyJWTCredential(key *Key, credFilePath string) (bool, error) {
	cred, err := getJWTFromFile(credFilePath)
	if err != nil {
		return false, errors.Wrapf(err, "could not get jwt from file: %s", credFilePath)
	}
	publicKey, err := key.GetPublicKey("", "")
	if err != nil {
		return false, err
	}

	verifier, err := jwt.GetVerifier(publicKey)
	if err != nil {
		return false, err
	}
	res, err := jwt.Parse(cred, jwt.WithSignatureVerifier(verifier))
	return res != nil, err
}
