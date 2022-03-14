//go:build jwx_es256k

package main

import (
	"encoding/json"
	"fmt"
	"github.com/TBD54566975/did-sdk/vc"
	"github.com/pkg/errors"

	"github.com/TBD54566975/did-sdk/cryptosuite"
)

func CreatePresentation(presFilePath, keyFilePath, outFilePath, format string) error {
	pres, err := getPresentationFromFile(presFilePath)
	if err != nil {
		return err
	}
	key, err := getKeyFromFile(keyFilePath)
	if err != nil {
		return err
	}
	signer, err := cryptosuite.NewJSONWebKeySigner(key.ID, key.PrivateKeyJWK, cryptosuite.Authentication)
	if err != nil {
		return err
	}

	var presBytes []byte
	var presErr error
	switch format {
	case VerifiablePresentationFormat:
		presBytes, presErr = createPresentation(signer, pres)
	case VerifiablePresentationJWTFormat:
		presBytes, presErr = createJWTPresentation(signer, pres)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if presErr != nil {
		return errors.Wrapf(presErr, "could not generate pres of format: %s", format)
	}
	return writeOutputToFile(presBytes, outFilePath)
}

func createPresentation(signer *cryptosuite.JSONWebKeySigner, pres *vc.VerifiablePresentation) ([]byte, error) {
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	if err := suite.Sign(signer, pres); err != nil {
		return nil, err
	}
	signedBytes, err := json.MarshalIndent(pres, "", "    ")
	if err != nil {
		return nil, err
	}
	return signedBytes, nil
}

func createJWTPresentation(signer *cryptosuite.JSONWebKeySigner, pres *vc.VerifiablePresentation) ([]byte, error) {
	jwtBytes, err := signer.SignVerifiablePresentationJWT(*pres)
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

func VerifyPresentation(presFilePath, keyFilePath, outFilePath, format string) error {
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
	case VerifiablePresentationFormat:
		verificationResult, verificationError = verifyPresentation(verifier, presFilePath)
	case VerifiablePresentationJWTFormat:
		verificationResult, verificationError = verifyJWTPresentation(verifier, presFilePath)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
	if verificationError != nil {
		return verificationError
	}
	return writeVerificationResult(verificationResult, outFilePath)
}

func verifyPresentation(verifier *cryptosuite.JSONWebKeyVerifier, presFilePath string) (bool, error) {
	pres, err := getPresentationFromFile(presFilePath)
	if err != nil {
		return false, errors.Wrapf(err, "could not get presentation from file: %s", presFilePath)
	}
	suite := cryptosuite.GetJSONWebSignature2020Suite()
	verificationResult := true
	if err := suite.Verify(verifier, pres); err != nil {
		verificationResult = false
	}
	return verificationResult, nil
}

func verifyJWTPresentation(verifier *cryptosuite.JSONWebKeyVerifier, presFilePath string) (bool, error) {
	pres, err := getJWTFromFile(presFilePath)
	if err != nil {
		return false, errors.Wrapf(err, "could not get jwt from file: %s", presFilePath)
	}
	err = verifier.VerifyJWT(pres)
	return err == nil, nil
}
