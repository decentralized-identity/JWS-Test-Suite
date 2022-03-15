//go:build jwx_es256k

package main

import (
	"encoding/json"
	"fmt"
	"github.com/TBD54566975/did-sdk/vc"
	"github.com/pkg/errors"

	"github.com/TBD54566975/did-sdk/cryptosuite"
)

func CreateCredential(credFilePath, keyFilePath, outFilePath, format string) error {
	cred, err := getCredentialFromFile(credFilePath)
	if err != nil {
		return err
	}
	key, err := getKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	signer, err := cryptosuite.NewJSONWebKeySigner(key.ID, key.PrivateKeyJWK, cryptosuite.AssertionMethod)
	if err != nil {
		return err
	}
	var credBytes []byte
	var credErr error
	switch format {
	case VerifiableCredentialFormat:
		credBytes, credErr = createCredential(signer, cred)
	case VerifiableCredentialJWTFormat:
		credBytes, credErr = createJWTCredential(signer, cred)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if credErr != nil {
		return errors.Wrapf(credErr, "could not generate cred of format: %s", format)
	}
	return writeOutputToFile(credBytes, outFilePath)
}

func createCredential(signer *cryptosuite.JSONWebKeySigner, cred *vc.VerifiableCredential) ([]byte, error) {
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	if err := suite.Sign(signer, cred); err != nil {
		return nil, err
	}
	signedBytes, err := json.Marshal(cred)
	if err != nil {
		return nil, err
	}
	return signedBytes, nil
}

func createJWTCredential(signer *cryptosuite.JSONWebKeySigner, cred *vc.VerifiableCredential) ([]byte, error) {
	jwtBytes, err := signer.SignVerifiableCredentialJWT(*cred)
	if err != nil {
		return nil, err
	}
	jwtFile := JWTJSONFile{JWT: string(jwtBytes)}
	signedBytes, err := json.MarshalIndent(jwtFile, "", "    ")
	if err != nil {
		return nil, err
	}
	return signedBytes, nil
}

func VerifyCredential(credFilePath, keyFilePath, outFilePath, format string) error {
	key, err := getKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	verifier, err := cryptosuite.NewJSONWebKeyVerifier(key.ID, key.PublicKeyJWK)
	if err != nil {
		return err
	}
	var verificationResult bool
	var verificationError error
	switch format {
	case VerifiableCredentialFormat:
		verificationResult, verificationError = verifyCredential(verifier, credFilePath)
	case VerifiableCredentialJWTFormat:
		verificationResult, verificationError = verifyJWTCredential(verifier, credFilePath)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if verificationError != nil {
		return verificationError
	}
	return writeVerificationResult(verificationResult, outFilePath)
}

func verifyCredential(verifier *cryptosuite.JSONWebKeyVerifier, credFilePath string) (bool, error) {
	cred, err := getCredentialFromFile(credFilePath)
	if err != nil {
		return false, errors.Wrapf(err, "could not get credential from file: %s", credFilePath)
	}
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	verificationResult := true
	if err := suite.Verify(verifier, cred); err != nil {
		verificationResult = false
	}
	return verificationResult, nil
}

func verifyJWTCredential(verifier *cryptosuite.JSONWebKeyVerifier, credFilePath string) (bool, error) {
	cred, err := getJWTFromFile(credFilePath)
	if err != nil {
		return false, errors.Wrapf(err, "could not get jwt from file: %s", credFilePath)
	}
	_, err = verifier.VerifyVerifiableCredentialJWT(cred)
	return err == nil, nil
}
