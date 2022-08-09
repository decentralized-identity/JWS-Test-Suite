package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/google/uuid"
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

func CreatePresentation(presFilePath, keyFilePath, outFilePath, format string) error {
	key, err := GetKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	vp, err := getPresentationFromFile(presFilePath)
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

	var vpBytes []byte
	var vpErr error
	switch format {
	case VerifiablePresentationFormat:
		vpBytes, vpErr = createPresentation(key.Id, signer, vp)
	case VerifiablePresentationJWTFormat:
		vpBytes, vpErr = createJWTPresentation(key.Id, privateKey, signer, vp)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if vpErr != nil {
		return errors.Wrapf(vpErr, "could not generate vp of format: %s", format)
	}
	return writeOutputToFile(vpBytes, outFilePath)
}

func createPresentation(KeyId string, signer verifiable.Signer, vp *verifiable.Presentation) ([]byte, error) {
	documentLoader, err := bddVerifiable.CreateDocumentLoader()
	if err != nil {
		return nil, err
	}
	err = vp.AddLinkedDataProof(&verifiable.LinkedDataProofContext{
		SignatureType:           "JsonWebSignature2020",
		SignatureRepresentation: verifiable.SignatureJWS,
		Suite:                   jsonwebsignature2020.New(suite.WithSigner(signer)),
		VerificationMethod:      KeyId,
		Challenge:               uuid.New().String(),
		Purpose:                 "authentication",
	}, jsonldsig.WithDocumentLoader(documentLoader))
	if err != nil {
		return nil, err
	}
	return json.MarshalIndent(vp, "", "    ")
}

func createJWTPresentation(KeyId string, privateKey *jwk.JWK, signer verifiable.Signer, vp *verifiable.Presentation) ([]byte, error) {
	keyType, err := privateKey.KeyType()
	if err != nil {
		return nil, err
	}
	jwsAlgo, err := verifiable.KeyTypeToJWSAlgo(keyType)
	if err != nil {
		return nil, err
	}
	claims, err := vp.JWTClaims([]string{}, false)
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

func VerifyPresentation(presFilePath, keyFilePath, outFilePath, format string) error {
	key, err := GetKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	var verificationResult bool
	var verificationError error
	switch format {
	case VerifiablePresentationFormat:
		verificationResult, verificationError = verifyPresentation(key, presFilePath)
	case VerifiablePresentationJWTFormat:
		verificationResult, verificationError = verifyJWTPresentation(key, presFilePath)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if verificationError != nil {
		return verificationError
	}
	return writeVerificationResult(verificationResult, outFilePath)
}

func verifyPresentation(key *Key, presFilePath string) (bool, error) {
	vpFile, err := ioutil.ReadFile(presFilePath)
	if err != nil {
		return false, err
	}
	documentLoader, err := bddVerifiable.CreateDocumentLoader()
	if err != nil {
		return false, err
	}
	parsedVP, err := verifiable.ParsePresentation(vpFile,
		verifiable.WithPresPublicKeyFetcher(key.GetPublicKey),
		verifiable.WithPresEmbeddedSignatureSuites(
			jsonwebsignature2020.New(suite.WithVerifier(jsonwebsignature2020.NewPublicKeyVerifier()))),
		verifiable.WithPresJSONLDDocumentLoader(documentLoader))
	return parsedVP != nil, err
}

func verifyJWTPresentation(key *Key, presFilePath string) (bool, error) {
	vpJWT, err := getJWTFromFile(presFilePath)
	if err != nil {
		return false, errors.Wrapf(err, "could not get jwt from file: %s", presFilePath)
	}
	publicKey, err := key.GetPublicKey("", "")
	if err != nil {
		return false, err
	}

	verifier, err := jwt.GetVerifier(publicKey)
	if err != nil {
		return false, err
	}
	res, err := jwt.Parse(vpJWT, jwt.WithSignatureVerifier(verifier))
	return res != nil, err
}
